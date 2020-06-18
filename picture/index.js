const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const mysql = require('../mysql');
const public = require('../public');
const { type } = require('os');

// 上传图片
exports.addPicture = (req, res, next) => {
    var form = new formidable.IncomingForm();
    let preservePath = path.join(__dirname + "/../data/images/b");
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../data/images/a");
    form.keepExtensions = true; //保留后缀
    form.multiples = true; //设置为多文件上传
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.parse(req, (err, fields, files) => {
        fields = JSON.parse(fields.pictures);
        if (err) {
            public.returnStatus(res, 0, err, null);
            return;
        }
        if (files.files.length) {
            for (let i = 0; i < files.files.length; i++) {
                let avatarName = +new Date() + (Math.floor(Math.random() * 8999) + 1000) + i + "." + fields[i].suffix;
                var newPath = preservePath + "/" + avatarName;
                fs.renameSync(files.files[i].path, newPath);
            }
        } else {
            let avatarName = +new Date() + (Math.floor(Math.random() * 8999) + 1000) + "." + fields[0].suffix;
            var newPath = preservePath + "/" + avatarName;
            fs.renameSync(files.files.path, newPath);
        }
        public.returnStatus(res, 1, null, null);
    })
}