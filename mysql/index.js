const mysql = require('mysql');

const mysqlConfig = {
    // 数据库的地址
    host: '127.0.0.1',
    //  连接数据库的用户名
    user: "root",
    //  连接数据的密码
    password: "123456",
    //  连接数据库的那个库
    database: "picture"
}

// 配置mysql连接池
const pool = mysql.createPool(mysqlConfig);


// 封装mysql语句
function query(sql, args, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            connection.release();
            return;
        }
        connection.query(sql, args, (err, rows) => {
            callback(err, rows);
            connection.release();
        })
    })
}

// 封装mysql语句(带事务)
function transactionQuery(sql, args, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            connection.release();
            return;
        }
        connection.beginTransaction((err) => {
            if (err) {
                callback(err, null);
                connection.release();
                return;
            }
            connection.query(sql, args, (err, rows) => {
                if (err) {
                    callback(err, null);
                    connection.rollback(); //   事务回滚
                    connection.release();
                    return;
                }
                callback(null, rows);
                connection.commit(); // 事务提交
                connection.release();
            })
        })
    })
}

exports.query = query;
exports.transactionQuery = transactionQuery;