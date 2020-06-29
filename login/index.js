const mysql = require('../mysql');
const public = require('../public');

// 用户登录
exports.login = (req, res, next) => {
    let sql = "select uid,username,type from t_user where username = ? and password = ?";
    let sqls = [req.body.name, req.body.password]
    mysql.query(sql, sqls, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items[0]);
    })
}