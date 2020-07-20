var express = require('express');
var conn = require('./db')
var router = express.Router();

// 1.学生添加接口
router.post('/add', function (req, res) {
    // 1.准备：接收参数
    let { name, account, tel, pwd } = req.body; //post请求获取参数
    // 2.执行：sql语句
    const sql = `insert into t_student (name, account, tel, pwd) values ('${name}', '${account}', '${tel}', '${pwd}')`;
    conn.query(sql, function (error, data) {
        // 3.测试：结果封装成json对象，再返回给前台
        if (data.affectedRows === 1) {
            res.json({
                code: 1,
                msg: '学生添加成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '学生添加失败'
            })
        }
    })
})

// 2.验证学生是否存在
router.get('/exist', function (req, res) {
    let { account } = req.query;
    const sql = `select count(*) number from t_student where account='${account}'`;
    conn.query(sql, function (error, data) {
        if (data[0].number === 0) {
            res.json({
                code: 1,
                msg: '恭喜你，该账号可用'
            })
        } else {
            res.json({
                code: 0,
                msg: '该账号已存在，请重置'
            })
        }
    })
})

// 3.获取学生列表并进行分页处理!!
router.get('/list', function (req, res) {
    let { page, pageSize } = req.query;
    let start = (page - 1) * pageSize;
    const sqls = 'select count(*) number from t_student;' + `select * from t_student order by id desc limit ${start},${pageSize}`;
    conn.query(sqls, (error, data) => {
        if (error) throw new Error('学生列表获取失败')
        if (data.length === 2) {
            // 处理返回数据
            res.json({
                total: data[0][0].number,
                data: data[1]
            })
        }
    })
})

// 4.获取一条数据
router.get('/readOne', function (req, res) {
    let { id } = req.query; //get请求获取参数
    const sql = `select * from t_student where id = ${id}`;
    conn.query(sql, (error, data) => {
        if (error) throw new Error('学生信息获取失败')
        if (data.length == 1) {
            res.json(data);
        }
    })
})
// 5.编辑学生信息
router.post('/edit', function (req, res) {
    let { id, name, account, tel, pwd } = req.body;
    const sql = `update t_student set name='${name}', account='${account}', tel='${tel}', pwd='${pwd}' where id='${id}'`
    conn.query(sql, function (error, data) {
        if (data.affectedRows === 1) {
            res.json({
                code: 1,
                msg: '学生编辑成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '学生编辑失败'
            })
        }
    })
})

// 5.删除数据（一条及以上）
router.get('/delete', function (req, res) {
    let { id } = req.query;
    const sql = `delete from t_student where id in (${id})`;
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

// 6.获取学生列表
router.get('/stulist', function (req, res) {
    const sql=`select * from t_student where inputtime >= date_format(date_sub(now(), INTERVAL 1 WEEK),'%Y-%m-%d') order by inputtime asc`;
    conn.query(sql,function(error,data){
        res.json(data)
    })
    // var rows = [];
    // for (let i = 9; i >= 0; i--) {
    //     var d = date('Y-m-d', time() - i * 24 * 3600);
    //     const sql = `select count(*) as num from t_student where date_format(inputtime, '%Y-%m-%d')='${d}'`;
    //     conn.query(sql, function (error, data) {
    //         // if (data.affectedRows === 1) {
    //         //     data.inputtime = d;
    //         //     rows.push(row)
    //         // }
    //         res.json(sql)
    //     })
    // }
})

module.exports = router;