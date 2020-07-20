// 引入mysql模块
var mysql = require('mysql');

// 配置数据库连接
var conn = mysql.createConnection({
    host: 'localhost', //主机域名
    user: 'root',      //用户名
    password: 'root',  //密码
    database: 'exam',   //数据库名
    multipleStatements: true   //开启同时执行多条SQL
})

// 连接数据库
conn.connect();

// 导出mysql
module.exports = conn;