const NodeRSA = require('node-rsa');
var JSZip = require('jszip');
const gm = require('gm');
const fs = require('fs');
const zip = new JSZip();


// 封装返回的信息
exports.returnStatus = (res, status, error, data) => {
    res.json({ status, data, error });
}

exports.rsa = () => {
    var key = new NodeRSA({ b: 512 }); //生成512位秘钥
    var pubkey = key.exportKey('pkcs8-public'); //导出公钥
    var prikey = key.exportKey('pkcs8-private'); //导出私钥
    console.log(pubkey);

}

// 图片缩略图
exports.thumbnail = (images) => {
    if (images instanceof Array) {
        images.forEach((image, index) => {
            _thumbnail(image);
        })
    } else {
        _thumbnail(images);
    }
}

function _thumbnail(image) {
    // 缩略图  "!"表示不保持宽高比,可能会变形 ^代表高度自适应
    gm(image.url).resize(image.width, image.height, "^").write(image.thumbnailPath, function(err) {
        if (err) {
            console.log(err);
        }
    });
}


/**
 *  压缩文件
 *  @param {arr} files 要压缩的文件信息
 *  @param {string} compressPath 压缩后存放的路径
 *  @param {string} compressName 压缩后的名字
 */
exports.compressFile = (files, compressPath, compressName) => {
    // 第一个参数为打包后的文件名
    // 第二个参数为文件路径
    files.forEach((fileData, index) => {
        zip.file(fileData.name, fs.readFileSync(fileData.filePath));
    })
    zip.generateAsync({
        // 压缩类型选择nodebuffer，在回调函数中会返回zip压缩包的Buffer的值，再利用fs保存至本地
        type: "nodebuffer",
        // 压缩算法
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    }).then(function(content) {
        // 写入磁盘
        fs.writeFile(compressPath + "/" + compressName + ".zip", content, function(err) {
            if (!err) {
                // 写入磁盘成功
                console.log(compressName + '压缩成功');
            } else {
                console.log(err);
                console.log(compressName + '压缩失败');
            }
        });
    })
}