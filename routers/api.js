var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Content');
var RateLimit = require('express-rate-limit');

var responseData;
//设置统一返回值
router.use(function (req,res,next) {
   responseData = {
       code:0,
       message:''
   };
   next();
});

router.get('/',function (req,res,next) {
    res.render('');
});

// 注册
router.post('/user/register',function (req,res,next) {
   var username = req.body.username;
   var password = req.body.password;
   var repassword = req.body.repassword;
    // 查询数据库中用户名是否已被注册
    User.findOne({
        username:username
    }).then(function (userInfo) {
        if (userInfo){
            responseData = {
                code:1,
                message:'用户名已存在！换一个试试吧'
            };
            res.json(responseData);
            return Promise.reject(new Error('用户名已存在'));
        }
        var user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function (newUser) {
        responseData.message = '注册成功！';
        res.json(responseData);
    }).catch(function (err) {
        next();
    })
});

//登陆
router.post('/user/login',function (req, res,next) {
   var username = req.body.username;
   var password = req.body.password;
//   查询数据库是否存在这个用户名
    User.findOne({
        username:username
    }).then(function (userInfo) {
        if (!userInfo){
            responseData = {
                code:2,
                message:'用户名不存在'
            };
            res.json(responseData);
            return Promise.reject(new Error('用户名不存在'));
        }else {
            if (userInfo.password != password){
                responseData = {
                    code:3,
                    message:'用户名或密码错误'
                };
                res.json(responseData);
                return Promise.reject(new Error('用户名或密码错误'));
            }else {
                responseData.message = '登陆成功';
                responseData.userInfo={
                    _id:userInfo._id,
                    username:userInfo.username
                };
                // 用户名转码base64解决cookie设置中文utf-8无效问题
                cookieUsername = Buffer.from(userInfo.username).toString('base64');
                req.cookies.set('userInfo',JSON.stringify({
                    _id:userInfo._id,
                    username:cookieUsername
                }));
                res.json(responseData);
            }
        }
    }).catch(function (err) {
        next();
    })
});

//退出
router.get('/user/logout',function (req, res) {
   req.cookies.set('userInfo',null);
   res.json(responseData);
});

// 获取指定文章的所有评论
router.get('/comment',function(req,res){
    // 内容的id
    var contentId = req.query.contentId || '';

    // 查询当前文章内容的消息
    Content.findOne({
        _id:contentId
    }).then(function(content){
        responseData.data=content;
        res.json(responseData);
    })
});

/*
*发表评论
* */
// 频率限制函数
var apiLimiter = new RateLimit({
    windowMs: 60*1000, // 1 minutes
    max: 2,
    delayMs: 0,
    message: "Too many accounts created from this IP, please try again after an hour"
});

router.post('/comment',apiLimiter,function (req, res) {
    var contentId = req.body.contentId || '';
    var postData = {
        username:req.userInfo.username,
        postTime:new Date(),
        commentText:req.body.commentText
    };
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.message='评论成功';
        responseData.data=newContent;
        res.json(responseData);
    })
});

module.exports = router;