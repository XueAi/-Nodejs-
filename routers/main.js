var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');

var data = {};

/*
 * 处理通用的数据
 **/
router.use(function(req,res,next){
    data = {
        userInfo:req.userInfo,
        categories:[]
    };
    Category.find().then(function(categories){
        data.categories = categories;
        next();
    });
});

/*
 * 首页
 **/
router.get('/',function(req,res,next){
    data.category=req.query.category || '';
    data.count= 0;
    data.page = Number(req.query.page || 1);
    data.limit = 4; // 每页显示条数
    data.pages = 0;

    var where = {};
    if (data.category) {
        where.category=data.category;
    }

    // 读取所有的分类信息
    Content.where(where).count().then(function(count){

        data.count = count;

        // 计算总页数
        data.pages = Math.ceil(data.count/data.limit);
        // 取值不能超过pages
        data.page = Math.min(data.page,data.pages);
        // 取值不能小于1
        data.page = Math.max(data.page,1);
        var skip = (data.page-1)*data.limit;

        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({addTime:-1});
    }).then(function(contents){
        data.contents=contents;
        res.render('home/index',data);
    });
});

/*
* Future页面
* */
router.get('/future',function (req,res){
    res.send('Opening in the future...')
});

/*
* logo大图页
* */
router.get('/logo',function (req, res) {
    res.render('home/logo')
});

// 详情页
router.get('/view',function(req,res){
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id:contentId
    }).populate(['category','user']).then(function(content){
        if (!content){
            res.send('抱歉，找不到此页面...');
        }else {
            data.content = content;
            content.views++;
            content.save();
            res.render('home/view',data);
        }
    });
});

module.exports = router;