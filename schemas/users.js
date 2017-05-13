var mongoose = require('mongoose');

module.exports = new mongoose.Schema({

    // 用户的表结构
    // 用户名
    'username':String,
    // 密码
    'password':String,
    // 管理员标志
    'isAdmin':{
        type:Boolean,
        default:false
    }

});