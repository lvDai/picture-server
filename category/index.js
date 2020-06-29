const public = require('../public');
const mysql = require('../mysql');

// 获取所有类别
exports.getAllCategory = (req, res, next) => {
    let sql = "select cid,title,`desc`,create_date,create_uid,lastmodify_date,lastmodify_uid from t_catalog";
    let sqlArr = null;
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 根据id搜索图片
exports.getByCategoryId = (req, res, next) => {
    let sql = `SELECT p.id id,p.url url FROM category c INNER JOIN pictures p 
    ON c.categoryId = p.categoryId WHERE c.categoryId = ? and p.status = 1`;
    let sqlArr = [req.query.categoryId * 1];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}