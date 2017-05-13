var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');
// 引入封装的数据分页处理模块
var dataPaging = require('./dataPaging');

router.use(function (req, res, next) {
    //非管理员用户不允许访问
   if (!req.userInfo.isAdmin){
       res.send('对不起，只有管理员才可以进入...');
       return;
   }
   next();
});
// 后台首页
router.get('/',function (req,res) {
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});

// 用户管理
router.get('/user',function (req, res) {
    // 获取页面url的pathname，用于翻页模板的翻页href的pathname，需要require('url')
    //var pagePathname = url.parse(req.originalUrl).pathname;

    //封装模块处理
    dataPaging(req,res,User,'admin/user_index');
});

// 分类管理首页
router.get('/category',function (req,res) {
    //封装模块处理
    dataPaging(req,res,Category,'admin/category_index');
});
// 添加分类页面
router.get('/category/add',function (req,res) {

    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
});
// 分类添加
router.post('/category/add',function (req,res) {
    var name = req.body.name || '';
    if (name == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类名不能为空！'
        });
        return;
    }
    Category.findOne({
        name:name
    }).then(function (categoryName) {
        if (categoryName){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类名已存在'
            });
            return Promise.reject();
        }else {
            return new Category({
                name:name
            }).save()
        }
    }).then(function (newCategory) {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'添加成功',
            url:'/admin/category'
        });
    })
});
// 分类修改
router.get('/category/edit',function (req, res) {
    var id = req.query.id || '';

    Category.findOne({
        _id:id
    }).then(function (category) {
        if (!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            })
        }
    })
});
// 分类的修改和保存
router.post('/category/edit',function(req,res){
    // 获取要修改的分类信息，并以表单的形式展现
    var id = req.query.id || '';
    // 获取post提交过来的名称
    var name = req.body.name || '';
    // 获取要修改的分类信息
    Category.findOne({
        _id:id
    }).then(function(category){
        if (!category) {
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            if (name == ''){
                res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'分类名不能为空'
                });
                return Promise.reject();
            }else{
                // 当用户没有作任何修改 提交的时候
                if (name == category.name) {
                    res.render('admin/success',{
                        userInfo:req.userInfo,
                        message:'修改成功',
                        url:'/admin/category'
                    });
                    return Promise.reject();
                }else {
                    // 要修改的信息是否已经存在于数据库中
                    return Category.findOne({
                        _id:{$ne:id}, // id不同
                        name:name
                    });
                }
            }
        }
    }).then(function(sameCategory){
        if (sameCategory) {
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'已存在同名信息'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            });
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'修改成功',
            url:'/admin/category'
        });
    });
});
// 分类的删除
router.get('/category/delete',function(req,res){
    var id = req.query.id || '';
    // 获取要删除的分类信息
    Category.findOne({
        _id:id
    }).then(function(category){
        if (!category) {
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            return Category.remove({
                _id:id
            })
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        });
    })
});

// 内容首页
router.get('/content',function (req, res) {
    var ref = ['category','user'];
    //封装模块处理
    dataPaging(req,res,Content,'admin/content_index',ref);
});
// 内容添加页面
router.get('/content/add',function (req, res) {
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        })
    });
});
// 添加内容
router.post('/content/add',function (req, res) {
    if (req.body.category == '' || req.body.title == '' || req.body.description == '' || req.body.content == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类、标题、简介、内容都不能为空哦！'
        });
        return;
    }

    // 保存到数据库
    new Content({
        category:req.body.category, // req.body.category的值是id
        title:req.body.title,
        user:req.userInfo._id.toString(), // 同上category，理解schema中type:mongoose.Schema.Types.ObjectId 及模板引用方法ref
        description:req.body.description,
        content:req.body.content
    }).save().then(function(rs){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        });
    });
});
// 修改内容
router.get('/content/edit',function (req, res) {
    Category.find().sort({_id:-1}).then(function (categories) {
        Content.findOne({
            _id:req.query.id
        }).populate('category').then(function (content) {
            if (!content){
                res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'不存在此内容'
                });
                return Promise.reject();
            }else {
                res.render('admin/content_edit',{
                    userInfo:req.userInfo,
                    content:content,
                    categories:categories
                })
            }
        });
    });
});
// 修改内容的保存
router.post('/content/edit',function (req, res) {

    if (req.body.category == '' || req.body.title == '' || req.body.description == '' || req.body.content == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类、标题、简介、内容都不能为空哦！'
        });
        return;
    }
    // 更新数据库
    Content.update({
        _id:req.query.id
    },{
        category:req.body.category, // req.body.category的值是id
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        })
    });
});
// 删除内容
router.get('/content/delete',function (req, res) {
    Content.findOne({
        _id:req.query.id
    }).then(function (content) {
        if (!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'内容不存在'
            });
            return Promise.reject();
        }else {
            return Content.remove({
                _id:req.query.id
            })
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        })
    })
});

/*
* 退出
* */
router.get('/user/logout',function (req, res) {
    req.cookies.set('userInfo',null);
    res.send('<h2 style="color:red;">您已退出管理员账号</p><a href="/">返回首页</a>');
});

module.exports = router;