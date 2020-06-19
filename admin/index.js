const public = require('../public');
const mysql = require('../mysql');


exports.filter = (req, res, next) => {
    if (req.baseUrl) {
        if (req.baseUrl == "/admin/login") {
            next();
            return;
        } else if (req.session.adminUser) {
            next();
            return;
        }
        public.returnStatus(res, 406, "权限不足", null);
        return false;
    }
    public.returnStatus(res, 405, "请求方式错误", null);
    return false;
}

exports.login = (req, res, next) => {
    let sql = "SELECT id,name,jurisdiction FROM adminuser WHERE name = ? and password = ?";
    let sqlArr = [req.body.name, req.body.password];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        if (items.length) {
            req.session.adminUser = items;
            public.returnStatus(res, 1, null, items);
            return;
        }
        public.returnStatus(res, 2, "账号或密码错误", null);

    })
}