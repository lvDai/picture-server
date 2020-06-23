const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const login = require('./login');
const banner = require('./banner');
const picture = require('./picture')
const admin = require('./admin')
const tag = require('./tag')
const category = require("./category")
const app = express();

// 设置get或post可以接受到参数
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// 设置session
app.use(session({
    name: 'lv',
    secret: 'lv',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 4 * 360 * 1000 }
}))

app.get("/", (req, res, next) => {
    console.log("aaaa");
    res.json(JSON.stringify({ name: "lv" }));
})

// 用户登录
app.post("/login", login.login);

// 获取所有的Banner图
app.get("/getAllBanner", banner.getAllBanner)

// 添加图片
app.post("/addPicture", picture.addPicture)

// 获取所有标签
app.get("/getAlltags", tag.getAlltags)

// 根据id搜索图片
app.get("/getByCategoryId", category.getByCategoryId);

// 根据tagId查询图片
app.get("/getByTagIdPictures", tag.getByTagIdPictures);

// 根据搜索的内容查询图片
app.get("/getContentPictures", picture.getContentPictures);

// 根据图片id查询详细信息
app.get("/getPictureDetail", picture.getPictureDetail);

app.get("/getPictureIdBytags", picture.getPictureIdBytags)

// 根据新发布的图片排序
app.get("/getNewRelease", picture.getNewRelease);

// 下载图片
app.post("/imageDownload", (req, res) => {
    res.download("../data/images/b/" + req.body.url);
})

// 根据图片id获取标签
app.get('/mysql', (req, res) => {
    res.download("../../../mysql/mysql-5.6.24-winx64.zip")
})

// 根据人气搜索图片
app.get("/getPopularityPicture", picture.getPopularityPicture)
    // 验证用户是否有权限下载
app.post("/postDownloadImage", picture.postDownloadImage);

// 后台管理过滤器
app.use("/admin**", admin.filter);

// 后台管理登录
app.post("/admin/login", admin.login);

// 获取分页用户数据
app.get("/admin/getUserPaging", admin.getUserPaging)

// 获取用户总数量
app.get("/admin/getUserAllPages", admin.getUserAllPages)

// 获取所有标签
app.get("/admin/getAllTags", admin.getAllTags)

// 添加标签
app.post("/admin/addTag", admin.addTag)

// 删除标签
app.post("/admin/removeTag", admin.removeTag);

// 获取所有类别
app.get("/getAllCategory", category.getAllCategory);

// 获取未审核的图片
app.get("/admin/getPagesNoAuditPictures", admin.getPagesNoAuditPictures);

// 获取已审核的图片
app.get("/admin/getPagesPicture", admin.getPagesPicture);

// 获取已审核的图片总条数
app.get("/admin/getAllAuditPictures", admin.getAllAuditPictures);

// 根据pictureId获取images
app.get("/admin/getImages", admin.getImages);

// 图片审核通过
app.post("/admin/pictureApprove", admin.pictureApprove);

// 图片审核失败
app.post("/admin/auditDefeated", admin.auditDefeated);

// 获取未审核的图片数量
app.get("/admin/getAllNoAuditPictures", admin.getAllNoAuditPictures);

// 获取所有的标签
app.get("/admin/getAllCategory", category.getAllCategory)

app.listen(3000, () => {
    console.log("service run succeed");
})