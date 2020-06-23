const public = require('../public');
const mysql = require('../mysql');


exports.getAlltags = (req, res, next) => {
    let sql = "select * from tag";
    let sqlArr = null;
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 根据tagId查询图片
exports.getByTagIdPictures = (req, res, next) => {
    let sql = `SELECT p.id id,url FROM picturescorrtag pt INNER JOIN pictures p
    ON pt.picturesId = p.id WHERE pt.tagId = ? and p.status = 1`;
    let sqlArr = [req.query.id];
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}