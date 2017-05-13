/*
* 数据的分页展示 封装
*   req、res直接传入
*   dataModel：要查询的数据库schema模板
*   url：要res.render的路径
*   ref：如果有schema数据引用，则传入引用
* */
module.exports = function (req,res,dataModel,url,ref) {
    // 当前第几页
    var page = Number(req.query.page || 1);
// 设置每页显示的数据量
    var limit = 10;
    dataModel.count().then(function (count) {
        // 总页数,不小于1
        var pageNum = Math.max(Math.ceil(count/limit),1);
        // 当前页数处于总页数和1之间
        page = Math.min(page,pageNum);
        page = Math.max(page,1);
        // 忽略条数,翻页查询数据时忽略前几页的
        var skip = (page-1)*limit;

        if (ref){
            dataModel.find().sort({_id:-1}).limit(limit).skip(skip).populate(ref).then(function (datas) {
                res.render(url,{
                    userInfo:req.userInfo,
                    page:page,
                    pageNum:pageNum,
                    count:count,
                    limit:limit,
                    datas:datas
                })
            });
        }else {
            dataModel.find().sort({_id:-1}).limit(limit).skip(skip).then(function (datas) {
                res.render(url,{
                    userInfo:req.userInfo,
                    page:page,
                    pageNum:pageNum,
                    count:count,
                    limit:limit,
                    datas:datas
                })
            });
        }
    });
};

