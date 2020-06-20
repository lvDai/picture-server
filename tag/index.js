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