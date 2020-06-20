const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const login = require('./login');
const banner = require('./banner');
const picture = require('./picture')
const admin = require('./admin')
const tag = require('./tag')
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

app.get('/mysql', (req, res) => {
    res.download("../../../mysql/mysql-5.6.24-winx64.zip")
})

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

app.listen(3000, () => {
    console.log("service run succeed");
})