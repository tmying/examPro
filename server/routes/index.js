var express = require('express');
var router = express.Router();
var conn = require('./db');
var jwt = require('jsonwebtoken');
var key = 'tmy'; //公共密钥

// 1.登录验证
router.post('/login', function (req, res) {
  let { account, pwd, role } = req.body;
  // 通过角色判断选择不同sql语句
  if (role == 0) {
    var sql = `select * from t_admin where account='${account}' and pwd='${pwd}'`;
  } else {
    var sql = `select * from t_student where account='${account}' and pwd='${pwd}'`;
  }
  conn.query(sql, function (error, data) {
    // res.json(data)
    if (data.length === 1) {
      let { name, account, pwd, role } = data[0];
      // 生成token    参数1：payload--简单对象  参数2：密钥--加密关键字  参数3：配置对象--expiresIn配置有效期
      let tokenId = jwt.sign({ name, account, pwd, role }, key, {
        expiresIn: 60 * 60 * 5 //有效期  单位是s，设置5h
      })
      // 成功时响应数据
      res.json({
        code: 1,
        msg: '登录成功',
        tokenId
      })
    } else {
      res.json({
        code: 0,
        msg: '登录失败，请检查账号和密码是否正确'
      })
    }
  })
});

// 2.验证token
router.post('/chelogin', function (req, res) {
  let { tokenId } = req.body;
  if (tokenId) {
    // 验证token，获得登录者信息
    jwt.verify(tokenId, key, function (error, data) {
      res.json({
        code: 1,
        data
      });
    })
  } else {
    res.json({
      code: 0,
      msg: '对不起您没有访问权限，请先登录'
    })
  }
})

// 3.修改密码
router.post('/changepwd', function (req, res) {
  let { account, newPwd } = req.body;
  const sql = `update t_student set pwd=${newPwd} where account=${account}`;
  conn.query(sql, function (error, data) {
    if (data.affectedRows === 1) {
      res.json({
        code: 1,
        msg: '修改密码成功，请重新登录'
      })
    } else {
      res.json({
        code: 0,
        msg: '修改密码失败'
      })
    }
  })
})

/* ------------------------------------------- */
// 获取当前学生的试卷表
router.get('/stuexam', function (req, res) {
  let { account } = req.query;
  const sql = `select * from t_exam where account='${account}'`;
  conn.query(sql, function (error, data) {
    res.json(data)
  })
})

// 1.添加试卷信息到试卷列表中，并获取自增id
router.get('/exam', function (req, res) {
  let { id } = req.query;
  const sql = `insert into t_exam (name, intro, items) select name, intro, items from t_paper where id=${id};` + 'select last_insert_id() examId';
  conn.query(sql, function (error, data) {
    if (error) throw new Error('试卷信息添加失败')
    if (data.length === 2) {
      res.json(data[1][0].examId)
    }
  })
})

// 2.添加参考者信息，并获得当前试卷信息
router.get('/examuser', function (req, res) {
  let { id, username, account } = req.query;
  const sql = `update t_exam set username='${username}', account='${account}' where id='${id}';` + `select * from t_exam where id=${id}`;
  conn.query(sql, function (error, data) {
    if (error) throw Error('学生进入考试页面失败')
    if (data.length === 2) {
      data[1][0].items = JSON.parse(data[1][0].items);
      res.json({
        code: 1,
        data: data[1][0]
      })
    }
  })
})

// 3.学生回答并改变试卷状态
router.get('/examanswer', function (req, res) {
  // let { id,items } = req.body; //报错：请求连接超时
  let { id, items } = req.query;
  const sql = `update t_exam set items = '${items}',state = '已答卷' where id='${id}'`;
  // console.log(items) //用post方式 undefined??
  conn.query(sql, function (error, data) {
    if (error) throw Error('学生答案录入失败')
    if (data.affectedRows === 1) {
      res.json({
        code: 1,
        msg: '学生答案录入成功'
      })
    }
  })
})
/*------------------------------*/
// 4.获取学生试卷列表并分页
router.get('/examlist', function (req, res) {
  let { page, pageSize } = req.query;
  let start = (page - 1) * pageSize;
  const sql = 'select count(*) number from t_exam;' + `select * from t_exam order by id desc limit ${start},${pageSize}`;
  conn.query(sql, function (error, data) {
    if (error) throw new Error('学生试卷列表获取失败')
    if (data.length === 2) {
      res.json({
        number: data[0][0].number,
        data: data[1] //无需处理items，指定页面用不到items
      })
    }
  })
})

// 5.获取指定id试卷
router.get('/exampaper', function (req, res) {
  let { id } = req.query;
  const sql = `select * from t_exam where id=${id}`;
  conn.query(sql, function (error, data) {
    if (error) throw new Error('当前试卷获取失败')
    if (data.length === 1) {
      // data[0].items = JSON.parse(data[0].items) //服务器会崩溃
      res.json(data[0])
    }
  })
})

// 6.教师打分并改变答题状态、获得当前试卷信息
router.get('/exammark', function (req, res) {
  // let { id,items } = req.body; //报错：请求连接超时
  let { id, items } = req.query;
  const sql = `update t_exam set items = '${items}',state = '已批改' where id=${id};` + `select * from t_exam where id=${id}`;
  // console.log(items) //用post方式 undefined??
  conn.query(sql, function (error, data) {
    if (error) throw Error('教师打分失败')
    if (data.length === 2) {
      data[1][0].items = JSON.parse(data[1][0].items)
      res.json({
        code: 1,
        data: data[1][0]
      })
    }
  })
})

// 7.更新学生总分
router.get('/grade', function (req, res) {
  let { id, grade } = req.query;
  const sql = `update t_exam set grade='${grade}' where id=${id}`;
  conn.query(sql, function (error, data) {
    if (error) throw Error('学生总分确定失败')
    if (data.affectedRows === 1) {
      res.json({
        code: 1,
        msg: '学生总分确定成功'
      })
    }
  })
})

module.exports = router;
