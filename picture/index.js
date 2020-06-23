const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const mysql = require('../mysql');
const public = require('../public');

// 获取上传图片的图片信息
exports.addPicture = (req, res, next) => {
    var form = new formidable.IncomingForm();
    let preservePath = path.join(__dirname + "/../../data/images/b");
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../../data/images/a");
    form.keepExtensions = true; //保留后缀
    form.multiples = true; //设置为多文件上传
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.parse(req, (err, fields, files) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        fields.pictures = JSON.parse(fields.pictures);
        if (files.files.length) {
            for (let i = 0; i < files.files.length; i++) {
                let avatarName = +new Date() + (Math.floor(Math.random() * 8999) + 1000) + i + "." + fields.pictures[i].suffix;
                var newPath = preservePath + "/" + avatarName;
                fs.renameSync(files.files[i].path, newPath);
                fields.pictures[i].url = avatarName;
            }
        } else {
            let avatarName = +new Date() + (Math.floor(Math.random() * 8999) + 1000) + "." + fields.pictures[0].suffix;
            var newPath = preservePath + "/" + avatarName;
            fs.renameSync(files.files.path, newPath);
            fields.pictures[0].url = avatarName;
        }
        savePictureData(fields, res, next);
    })
}

// 保存上传的图片信息到pictures数据库
function savePictureData(fields, res, next) {
    let defaultDisplay = fields.defaultDisplay * 1;
    let sql = "INSERT INTO pictures(source,userId,url,categoryId) VALUES(?,?,?,?)";
    let sqlArr = [fields.textarea, fields.userId * 1, fields.pictures[defaultDisplay].url, fields.categoryId];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        savePictureImages(items.insertId, fields, res, next)
    })
}

// 保存上传的图片信息到images数据库
function savePictureImages(id, fields, res, next) {
    let pictures = fields.pictures;
    let sql = "INSERT INTO images(url,suffix,size,pixel,jurisdiction,pictureId) VALUES";
    let sqlArr = []
    for (let i = 0; i < pictures.length; i++) {
        sql += "(?,?,?,?,?,?)";
        let jurisdiction = (fields.defaultDisplay * 1 == i) ? 1 : 2;
        let { url, suffix, size, pixel } = pictures[i];
        sqlArr.push(url);
        sqlArr.push(suffix);
        sqlArr.push(size);
        sqlArr.push(pixel);
        sqlArr.push(jurisdiction);
        sqlArr.push(id);
        if (pictures.length - 1 > i) {
            sql += ",";
        }
    }
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        saveLabel(id, JSON.parse(fields.selectedTags), res, next)
    })
}

// 保存图片所拥有的标签
function saveLabel(id, data, res, next) {
    let sql = "INSERT INTO picturescorrtag(picturesId,tagId) values";
    let sqlArr = [];
    for (let i = 0; i < data.length; i++) {
        sql += "(?,?)";
        sqlArr.push(id)
        sqlArr.push(data[i].id)
        if (data.length - 1 > i) {
            sql += ",";
        }
    }
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, "成功");
    })
}

// 根据搜索的内容查询图片
exports.getContentPictures = (req, res, next) => {
    let sql = `SELECT p.id id,url FROM pictures p WHERE source LIKE CONCAT('%',?,'%') OR categoryId IN (
        SELECT categoryId id FROM category WHERE NAME LIKE CONCAT('%',?,'%') 
        ) AND p.status = 1`;
    let sqlArr = [req.query.content, req.query.content];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 根据图片id查询详细信息
exports.getPictureDetail = (req, res, next) => {
    let sql = `SELECT p.id id,p.publishTime publishTime,p.source source,p.url url,u.name name 
    FROM pictures p INNER JOIN USER u ON p.userId = u.id WHERE p.id = ?`;
    let sqlArr = [req.query.id * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        getByPictureIdImages(req, res, items[0])
    })
}

// 根据图片id查询images
function getByPictureIdImages(req, res, data) {
    let sql = "SELECT id,suffix,size,pixel,jurisdiction FROM images WHERE pictureId = ?";
    let sqlArr = [req.query.id * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        data.images = items;
        public.returnStatus(res, 1, null, data);
    })
}

// 根据图片id获取标签
exports.getPictureIdBytags = (req, res, next) => {
    let sql = `SELECT id,text FROM tag WHERE id in (
        SELECT tagId id FROM picturescorrtag WHERE picturesId = ?
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

// 验证用户是否有权限下载
exports.postDownloadImage = (req, res, next) => {
    let sql = "SELECT url,jurisdiction FROM images WHERE id = ?";
    let sqlArr = [req.body.imageId];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        if (items.length) {
            if (items[0].jurisdiction == 1) {
                public.returnStatus(res, 1, null, items);
                return;
            }
            verifyUserJurisdiction(req, res, items[0])
        } else {
            public.returnStatus(res, 2, "未查询到此图片", null);
        }
    })
}

function verifyUserJurisdiction(req, res, data) {
    let sql = "SELECT jurisdiction FROM user WHERE id = ?";
    let sqlArr = [req.body.id];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        if (items.length) {
            if (items[0].jurisdiction == 2) {
                public.returnStatus(res, 1, null, data);
                return;
            }
        }
        public.returnStatus(res, 3, "权限不够", null);
    })
}

// 根据人气搜索图片
exports.getPopularityPicture = (req, res, next) => {
    let sql = "SELECT id,url FROM pictures WHERE status = 1 LIMIT ?,?";
    let sqlArr = [(req.query.index - 1) * req.query.pages, req.query.pages * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}

// 根据新发布的图片排序
exports.getNewRelease = (req, res, next) => {
    let sql = "SELECT id,url FROM pictures WHERE STATUS = 1 ORDER BY publishTime DESC  LIMIT ?,?";
    let sqlArr = [(req.query.index - 1) * req.query.pages, req.query.pages * 1];
    mysql.query(sql, sqlArr, (err, items) => {
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        public.returnStatus(res, 1, null, items);
    })
}