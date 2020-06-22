const public = require('../public');
const mysql = require('../mysql');

// 获取所有类别
exports.getAllCategory = (req, res, next) => {
    let sql = "select categoryId id,name from category";
    let sqlArr = null;
    mysql.transactionQuery(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}