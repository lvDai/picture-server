const NodeRSA = require('node-rsa');


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