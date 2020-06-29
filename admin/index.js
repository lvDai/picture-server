const public = require('../public');
const mysql = require('../mysql');


exports.filter = (req, res, next) => {
    next();
    return;
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

exports.getUserPaging = (req, res, next) => {
    let sql = "SELECT uid,username,email,cellphone,type,create_date,lastmodify_date FROM t_user LIMIT ?,?";
    let sqlArr = [(req.query.index * 1 - 1) * req.query.pages, req.query.pages * 1];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

exports.getUserAllPages = (req, res, next) => {
    let sql = "select COUNT(*) count from user";
    let sqlArr = null;
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

exports.getAllTags = (req, res, next) => {
    let sql = "select * from  tag";
    let sqlArr = null;
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}


exports.addTag = (req, res, next) => {
    let sql = "INSERT into tag(text) values(?)";
    let sqlArr = [req.body.text];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

exports.removeTag = (req, res, next) => {
    let sql = "delete FROM tag WHERE id = ?";
    let sqlArr = [req.body.id];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 获取未审核的图片
exports.getPagesNoAuditPictures = (req, res, next) => {
    let sql = "SELECT id,publishTime,source,userId,url,categoryId FROM pictures WHERE STATUS = 0 limit ?,?";
    let sqlArr = [(req.query.index - 1) * req.query.pages, req.query.pages * 1];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 获取已审核的图片
exports.getPagesPicture = (req, res, next) => {
    let sql = "SELECT id,publishTime,source,userId,url,categoryId FROM pictures WHERE STATUS = 1 limit ?,?";
    let sqlArr = [(req.query.index - 1) * req.query.pages, req.query.pages * 1];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

exports.getImages = (req, res, next) => {
    let sql = "select id,url,suffix,size,pixel from images where pictureId = ?";
    let sqlArr = [req.query.pictureId];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

exports.pictureApprove = (req, res, next) => {
    let sql = "update pictures set status = 1 where id = ?";
    let sqlArr = [req.body.id];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

exports.auditDefeated = (req, res, next) => {
    let sql = "update pictures set status = 2 where id = ?";
    let sqlArr = [req.body.id];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        let sql = "INSERT into auditDefeated(pictureId,cause) values(?,?)";
        let sqlArr = [req.body.id, req.body.cause];
        mysql.transactionQuery(sql, sqlArr, (err, items) => {
            if (err) {
                public.returnStatus(res, 0, err, null);
                return;
            }
            public.returnStatus(res, 1, null, items);
        })
    })
}

exports.getAllAuditPictures = (req, res, next) => {
    let sql = "select COUNT(*) count from pictures where status = 1";
    let sqlArr = null;
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

exports.getAllNoAuditPictures = (req, res, next) => {
    let sql = "select COUNT(*) count from pictures where status = 0";
    let sqlArr = null;
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}