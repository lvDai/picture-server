// 封装返回的信息
exports.returnStatus = (res, status, error, data) => {
    res.json({ status, data, error })
}