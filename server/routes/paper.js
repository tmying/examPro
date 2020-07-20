var express = require('express');
var conn = require('./db')
var router = express.Router();

// 1.内嵌表单添加
router.post('/addItem', function (req, res) {
    let { num, score, question } = req.body;
    const sql = `insert into t_paperitem (num,score,question) values ('${num}','${score}','${question}')`;
    conn.query(sql, function (error, data) {
        if (data.affectedRows === 1) {
            res.json({
                code: 1,
                msg: '内嵌表单添加成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '内嵌表单添加失败'
            })
        }
    })
})

// 2.删除内嵌表一条数据
router.get('/delOne', function (req, res) {
    let { num } = req.query;
    const sql = `delete from t_paperitem where num=${num}`;
    conn.query(sql, function (error, data) {
        if (data.affectedRows === 1) {
            res.json({
                code: 1,
                msg: '删除试题成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '删除试题失败'
            })
        }
    })
})
// 3.获取试卷内嵌表
router.get('/getItems', function (req, res) {
    const sql = 'select * from t_paperitem order by num asc';
    conn.query(sql, function (error, data) {
        data.forEach(val => {
            val.question = JSON.parse(val.question)
        })
        res.json(data)
    })
})

// 4.试卷添加并清空内嵌表数据
router.post('/add', function (req, res) {
    let { name, intro, items } = req.body;
    const sql = `insert into t_paper (name, intro, items) values ('${name}', '${intro}', '${items}');` + 'truncate t_paperitem';
    conn.query(sql, function (error, data) {
        if (data[0].affectedRows && !data[1].affectedRows) {
            res.json({
                code: 1,
                msg: '试卷添加成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '试卷添加失败'
            })
        }
    })
})

/* ---------------------------------- */

// 5.获取试卷列表并分页
router.get('/list', function (req, res) {
    let { page, pageSize } = req.query;
    let start = (page - 1) * pageSize;
    const sql = 'select count(*) number from t_paper;' + `select * from t_paper order by id desc limit ${start},${pageSize}`;
    conn.query(sql, function (error, data) {
        // res.json(data)
        if (error) throw new Error('试卷列表获取失败')
        if (data.length === 2) {
            // 【特级bug】将表格数据items转换为json对象
            data[1].forEach(paper => {
                paper.items = JSON.parse(paper.items)
                // paper.items = eval('(' + paper.items + ')');  不行
            })
            res.json({
                number: data[0][0].number,
                data: data[1]
            })
        }
    })
})

// 6.删除试卷(only one)
router.get('/delPaper', function (req, res) {
    let { id } = req.query;
    const sql = `delete from t_paper where id=${id}`;
    conn.query(sql, function (error, data) {
        if (data.affectedRows === 1) {
            res.json({
                code: 1,
                msg: '删除试卷成功'
            })
        } else {
            res.json({
                code: 0,
                msg: '删除试卷失败'
            })
        }
    })
})

module.exports = router;