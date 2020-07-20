var express = require('express');
var conn = require('./db');
var router = express.Router();

// 1.添加试题
router.post('/add', function (req, res) {
  let { type, title, option1, option2, option3, option4, answer } = req.body;
  // 监听父组件得type值，通过type判断是哪种试题类型并执行sql语句
  if (type == 0) {
    const sql = `insert into t_question (type,title, option1, option2, option3, option4, answer) values ('选择题','${title}', '${option1}', '${option2}', '${option3}', '${option4}', '${answer}')`;
    exe(sql);
  }
  if (type == 1) {
    const sql = `insert into t_question (type,title,answer) values ('填空题','${title}','${answer}')`;
    exe(sql);
  }
  if (type == 2) {
    const sql = `insert into t_question (type,title,answer) values ('判断题','${title}','${answer}')`;
    exe(sql);
  }
  if (type == 3) {
    const sql = `insert into t_question (type,title) values ('名词解释','${title}')`;
    exe(sql);
  }
  if (type == 4) {
    const sql = `insert into t_question (type,title) values ('简答题','${title}')`;
    exe(sql);
  }
  // 封装测试
  function exe(sql) {
    conn.query(sql, function (error, data) {
      if (data.affectedRows === 1) {
        res.json({
          code: 1,
          msg: '试题添加成功'
        })
      } else {
        res.json({
          code: 0,
          msg: '试题添加失败'
        })
      }
    })
  }
})

// 2.获取试题列表并分页
router.get('/list', function (req, res) {
  let { page, pageSize } = req.query;
  let start = (page - 1) * pageSize;
  const sql = 'select count(*) number from t_question;' + `select * from t_question order by id desc limit ${start},${pageSize}`;
  conn.query(sql, function (error, data) {
    res.json({
      total: data[0][0].number,
      data: data[1]
    })
  })
})

// 3.筛选试题类型并分页
router.get('/select', function (req, res) {
  let { type, page, pageSize } = req.query;
  let start = (page - 1) * pageSize;
  // 【注意】：type必须加上引号，否则要报错
  const sql = `select count(*) number from t_question where type='${type}';` + `select * from t_question where type='${type}' limit ${start},${pageSize}`;
  conn.query(sql, function (error, data) {
    res.json({
      total: data[0][0].number,
      data: data[1]
    })
  })
})

// 4.删除数据（一条及以上）
router.get('/delete', function (req, res) {
  let { id } = req.query;
  const sql = `delete from t_question where id in (${id})`;
  conn.query(sql, function (error, data) {
    if (data.affectedRows >= 0) {
      res.json({
        code: 1,
        msg: '删除成功'
      })
    } else {
      res.json({
        code: 0,
        msg: '删除失败'
      })
    }
  })
})

// 5.获取试题列表
router.get('/listAll', function (req, res) {
  const sql = 'select * from t_question order by id desc';
  conn.query(sql, function (error, data) {
    res.json(data);
  })
})








module.exports = router;