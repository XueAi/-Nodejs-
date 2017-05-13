$(function(){
    var $login = $('#login');
    var $register = $('#register');
    var $userInfo = $('.userForm .userInfo');
    var $logout = $userInfo.find('.logout');
    //初始选择登陆or注册
    $('.accessBtn').on('click','button',function () {
       if($(this).hasClass('toRegister')){
           $('.accessBtn').hide();
           $register.fadeIn();
       }else{
           $('.accessBtn').hide();
           $login.fadeIn();
       }
    });
    //切换到注册
    $login.find('a.handover').on('click',function () {
        $login.hide();
        $register.fadeIn();
    });
    //切换到登陆
    $register.find('a.handover').on('click',function () {
        $register.hide();
        $login.fadeIn();
    });
    //注册
    $register.find('button').on('click',function () {
        var $username = $register.find('[name="username"]').val();
        var $password = $register.find('[name="password"]').val();
        var $repassword = $register.find('[name="repassword"]').val();
        var $warning = $register.find('.warning');
        if ($username === ''){
            $warning.html('用户名不能为空！');
            return;
        }else{
            $warning.html('');
        }
        if ($password !== $repassword){
            $warning.html('两次输入密码不一致！');
            return;
        }else{
            if ($password === ''){
                $warning.html('密码不能为空！');
                return;
            }else{
                $warning.html('');
            }
            $warning.html('');
        }
        $.ajax({
            type:'POST',
            url:'/api/user/register',
            data:{
                username:$username,
                password:$password,
                repassword:$repassword
            },
            dataType:'JSON',
            success:function (result) {
                $warning.html(result.message);
                if (!result.code){
                    setTimeout(function () {
                        $register.hide();
                        $login.fadeIn();
                    },1000)
                }
            }
        })
    });
    //登录
    $login.find('button').on('click',function () {
        var $username = $login.find('[name="username"]').val();
        var $password = $login.find('[name="password"]').val();
        var $warning = $login.find('.warning');
        if ($username === ''){
            $warning.html('用户名不能为空！');
            return;
        }else{
            $warning.html('');
        }
        if ($password === ''){
            $warning.html('密码不能为空！');
            return;
        }else{
            $warning.html('');
        }
        $.ajax({
            type:'POST',
            url:'/api/user/login',
            data:{
                username:$username,
                password:$password
            },
            dataType:'JSON',
            success:function (result) {
                $warning.html(result.message);
                if (!result.code){
                    setTimeout(function () {
                        window.location.reload();
                    },500)
                }
            }
        })
    });
    //退出
    $logout.on('click',function () {
        $.ajax({
            url:'/api/user/logout',
            success:function (result) {
                if (!result.code){
                    window.location.reload();
                }
            }
        })
    })
});