/*
* 应用入口文件
* */
var express = require('express');
// 加载模板处理模块
var swig = require('swig');
// 加载数据库处理模块
var mongoose = require('mongoose');
// 加载body-parser模块，用来处理post请求过来的数据
var bodyParser = require('body-parser');
// 加载cookies模块
var Cookies = require('cookies');
// 加载path模块
var path = require('path');
// 加载百度文本编辑器ueditor模块
var ueditor = require('ueditor');
// 加载设置http头的helmet模块
var helmet = require('helmet');
// 加载数据库模型User
var User = require('./models/User');
// 创建app应用， => NodeJS Http.creatServer()
var app = express();

app.use(helmet());
// 设置静态文件托管
app.use('/public',express.static(__dirname+'/public'));

// 设置body-parser
app.use(bodyParser.urlencoded({extended:true}));

// 设置cookies
app.use(function (req,res,next) {
   req.cookies = new Cookies(req,res);
   req.userInfo = {};

   if (req.cookies.get('userInfo')){
       var userInfo = JSON.parse(req.cookies.get('userInfo'));
       // cookie中用户名需要再转码回来
       var cookieUsername = Buffer.from(userInfo.username,'base64').toString() || '';
       // 尝试查询数据库中是否存在cookie中的用户
       try{
           User.findOne({
               username:cookieUsername
           }).then(function (user) {
               console.log(user);
               // 如果数据库中存在该用户，比较其_id是否与cookie中的相同，防止修改本地cookie访问
               if (user){
                   if (userInfo._id == user._id){
                       userInfo.username=cookieUsername;
                        req.userInfo = userInfo;
                        req.userInfo.isAdmin = user.isAdmin;
                        next();
                   }else {next();}
               }else {next();}
           })
       }catch(err){next();}
   }else {next();}
});

//设置ueditor
app.use(bodyParser.json());
app.use("/public/ueditor/ue", ueditor(path.join(__dirname, ''), function(req, res, next) {
    //客户端上传文件设置
    var imgDir = '/public/images/ueditor/img';
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir; //默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/public/file/ueditor/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/public/video/ueditor/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        res.ue_list(imgDir); // 客户端会列出 imgDir 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/public/ueditor/php/config.json');
    }
}));

// 配置应用模板
// 定义当前应用使用的模板引擎，第一个参数：模板引擎的名称，也是其文件后缀；第二个参数解析方法
app.engine('html',swig.renderFile);
// 设置模板存放目录，第一个参数必须是views
app.set('views','./views');
// 注册模板引擎，第一个参数不可变，第二个参数必须与上面app.engine中的名称一致
app.set('view engine','html');
// 开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

/*
* 根据不同的功能划分模块
* */
app.use('/',require('./routers/main'));
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));

// mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1/blog',function (err) {
    if (err){
        console.log('数据库连接失败');
        console.log(err);
    }else{
        console.log('数据库连接成功');
        app.listen(3000);
    }
});
