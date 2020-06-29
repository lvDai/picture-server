const formidable = require('formidable');
const public = require('../public');
const path = require('path');
const fs = require('fs');
const mysql = require('../mysql');

// 添加相簿
exports.addAlbum = (req, res) => {
    var form = new formidable.IncomingForm();
    let preservePath = path.join(__dirname + "/../../data/images/b");
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../../data/images/a");
    form.keepExtensions = true; //保留后缀
    form.multiples = true; //设置为多文件上传
    form.maxFieldsSize = 100 * 1024 * 1024;
    form.parse(req, (err, fields, files) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        fields.form = JSON.parse(fields.form);
        let avatarName = +new Date() + (Math.floor(Math.random() * 8999) + 1000) + "." + files.file.name.substring(files.file.name.length - 4);
        var newPath = preservePath + "/" + avatarName;
        fs.renameSync(files.file.path, newPath);
        fields.form.url = avatarName;
        addAlbumDabe(res, fields);
    })
}

// 添加到相簿数据库
function addAlbumDabe(res, fields) {
    let sql = "INSERT INTO t_album(title,url,`desc`,publish,create_uid,lastmodif_uid) values(?,?,?,?,?,?)";
    let data = fields.form;
    let sqlArr = [data.title, data.url, data.editorContent, data.resource, data.uid * 1, data.uid * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        addAlbumCatalog(res, items.insertId, fields)
    })
}

// 添加相簿分类关联表
function addAlbumCatalog(res, id, fields) {
    let sql = "INSERT INTO t_album_catalog(aid,cid) values";
    let sqlArr = []
    for (let i = 0; i < fields.form.checkboxGroup.length; i++) {
        sql += "(?,?)";
        sqlArr.push(id);
        sqlArr.push(fields.form.checkboxGroup[i]);
        if (i < fields.form.checkboxGroup.length - 1) {
            sql += ",";
        }
    }
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, null);
    })
}

// 获取所有分类
exports.getAllCatalog = (req, res) => {
    let sql = "select cid,title from t_catalog";
    let sqlArr = null;
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 获取相簿信息
exports.getAlbumPaging = (req, res) => {
    let sql = `SELECT aid,title,url,publish,ta.create_date create_date,ta.lastmodify_date lastmodify_date,
    tu.username create_username,tu1.username lastmodif_username
    FROM t_album ta INNER JOIN t_user tu ON ta.create_uid = tu.uid
    INNER JOIN t_user tu1 ON ta.lastmodif_uid = tu1.uid WHERE ta.publish = ? LIMIT ?,?`;
    let sqlArr = [req.query.public * 1, (req.query.index - 1) * req.query.pages, req.query.pages * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}


//  获取相簿详细数据
exports.getAlbumDetail = (req, res) => {
    let sql = `SELECT aid,title,url,publish,ta.\`desc\` \`desc\`,ta.create_date create_date,ta.lastmodify_date lastmodify_date,
    tu.username create_username,tu1.username lastmodif_username
    FROM t_album ta INNER JOIN t_user tu ON ta.create_uid = tu.uid
    INNER JOIN t_user tu1 ON ta.lastmodif_uid = tu1.uid WHERE ta.aid = ?`;
    let sqlArr = [req.query.id * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 修改相簿
exports.updateAlbum = (req, res) => {
    let sql = "UPDATE t_album SET title = ?,publish = ?,`desc` = ? where aid = ?";
    let sqlArr = [req.body.title, req.body.publish, req.body.desc, req.body.aid];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 删除相簿
exports.removeAlbume = (req, res) => {
    let sql = "DELETE from t_album where aid = ?";
    let sqlArr = [req.body.id];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, null);
    })
}

// 根据分页查询群组
exports.getPagingGroup = (req, res) => {
    let sql = "select gid,title,`desc`,create_date,lastmodify_date from t_group limit ?,?";
    let sqlArr = [(req.query.index - 1) * req.query.pages, req.query.pages * 1]
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 查询相簿总条数
exports.getAlbumAllPages = (req, res) => {
    let sql = "select COUNT(*) count from t_album where publish = ?";
    let sqlArr = [req.query.public * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 添加群组
exports.addGroup = (req, res) => {
    let sql = "insert into t_group(title,`desc`,create_uid,lastmodify_uid) values(?,?,?,?)";
    let sqlArr = [req.body.title, req.body.desc, req.body.uid, req.body.uid];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, null);
    })
}

// 删除群组
exports.removeGroup = (req, res) => {
    let sql = "DELETE from t_group where gid = ?";
    let sqlArr = [req.body.id];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, null);
    })
}

// 获取所有的群组
exports.getAllGroup = (req, res) => {
    let sql = "select gid,title from t_group";
    let sqlArr = null;
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 根据群组id获取非这个id的所有相簿
exports.getNoGidAlbum = (req, res) => {
    let sql = `SELECT aid,title FROM t_album WHERE aid NOT IN  (
        SELECT  gid FROM t_album_group  WHERE aid = ?
    )`;
    let sqlArr = [req.query.id * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 添加相簿到群组
exports.addAlbumGroup = (req, res) => {
    let sql = "INSERT INTO t_album_group(aid,gid) VALUES";
    let sqlArr = [];
    for (let i = 0; i < req.body.aids.length; i++) {
        sql += "(?,?)";
        sqlArr.push(req.body.aids[i] * 1);
        sqlArr.push(req.body.gid * 1);
        if (req.body.aids.length - 1 > i) {
            sql += ",";
        }
    }
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, null);
    })
}