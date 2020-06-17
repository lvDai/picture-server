const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const login = require('./login');
const banner = require('./banner');
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

app.listen(3000, () => {
    console.log("service run succeed");
})