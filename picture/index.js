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
    let sql = "INSERT INTO pictures(source,userId,url) VALUES(?,?,?)";
    let sqlArr = [fields.textarea, fields.userId * 1, fields.pictures[defaultDisplay].url];
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