const mysql = require('../mysql');
const public = require('../public');

// 用户登录
exports.login = (req, res, next) => {
    let sql = "select id,name,status from user where name = ? and password = ?";
    let sqls = [req.body.name, req.body.password]
    mysql.query(sql, sqls, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        if (!items.length) {
            public.returnStatus(res, 3, "用户名或者密码错误", null);
        } else if (items[0].status == 1) {
            req.session.user = items[0];
            public.returnStatus(res, 1, null, items[0]);
        } else {
            public.returnStatus(res, 2, "此账号应违规暂时已经被封号", null);
        }
    })
}