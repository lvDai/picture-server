const mysql = require('../mysql');
const public = require('../public');

exports.getAllBanner = (req, res, next) => {
    let sql = "SELECT bid,url,title,aid FROM  t_banner ORDER BY sort ASC";
    mysql.query(sql, null, (err, itmes) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        if (itmes.length) {
            public.returnStatus(res, 1, null, itmes);
            return;
        } else {
            public.returnStatus(res, 2, "未查询到banner数据", null);
            return;
        }
    })
}