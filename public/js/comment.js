var page = 1,
    comments =[],
    $commentForm = $('#comment'),
    $messageList = $('#message').find('table'),
    $pager = $('.pager');

// 评论提交ajax传输数据
$commentForm.find('button').on('click',function () {
    var $commentText = UE.getEditor('commentUeditor').getContent();
    if ($commentText === ''){
        $commentForm.find('.warning').html('评论不能为空！');
        return;
    }else {
        $commentForm.find('.warning').html('');
    }
    if (UE.getEditor('commentUeditor').getContentTxt().length > 5) {
        alert('超出字数限制');
        return;
    }
    $.ajax({
        type:'POST',
        url:'/api/comment',
        data:{
            commentText:UE.getEditor('commentUeditor').getContent(),
            contentId:$('#contentId').val()
        },
        dataType:'JSON',
        success:function (rs) {
            UE.getEditor('commentUeditor').setContent('');
            comments = rs.data.comments.reverse();
            renderComments();
        }
    })
});

// 每次页面重载的时候获取一下该文章的所有评论
$.ajax({
    url:'/api/comment',
    data:{
        contentId:$('#contentId').val()
    },
    dataType:'JSON',
    success:function (rs) {
        comments=rs.data.comments.reverse();
        renderComments();
    }
});

// 加载分页评论函数
function renderComments() {
    var commentHtml = '',
        count = comments.length,
        limit = 10,
        pageNum = Math.max(Math.ceil(count/limit),1),
        start = (page-1)*limit,
        end = Math.min(start+limit,count);
    $pager.find('.page').html(page+'/'+pageNum);
    if (page <= 1) {
        $pager.find('.previous').html('<span>没有上一页了</span>');
    }else{
        $pager.find('.previous').html('<a href="javascript:;"><span aria-hidden="true">&larr;</span> 上一页</a>');
    }
    if (page >= pageNum) {
        $pager.find('.next').html('<span>没有下一页了</span>');
    }else{
        $pager.find('.next').html('<a href="javascript:;">下一页 <span aria-hidden="true">&rarr;</span></a>');
    }
    if (count == 0){
        $messageList.html('<tr><td class="text-center">暂时还没有评论</td></tr>');
    }else {
        for (var i=start;i<end;i++){
            commentHtml+='<tr class="row"><td class="uname"><strong>'+comments[i].username+'：</strong></td><td class="text-right utime">'+dateFormat(comments[i].postTime)+'</td></tr><tr><td class="text-indent utext" colspan="3">'+comments[i].commentText+'</td></tr>'
        }
        $messageList.html(commentHtml);
    }
}

// 时间格式化函数
function dateFormat(d) {
    var date = new Date(d);
    var MM = ((date.getMonth()+1)<10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1),
        DD = (date.getDate()<10) ? '0'+date.getDate() : date.getDate(),
        hh = (date.getHours()<10) ? '0'+date.getHours() : date.getHours(),
        mm = (date.getMinutes()<10) ? '0'+date.getMinutes() : date.getMinutes(),
        ss = (date.getSeconds()<10) ? '0'+date.getSeconds() : date.getSeconds();
    return date.getFullYear()+'-'+MM+'-'+DD+' '+hh+':'+mm+':'+ss;
}

// 点击翻页的时间委托
$pager.on('click','a',function () {
   if ($(this).parent().hasClass('previous')){
       page--
   }else {
       page++
   }
    renderComments();
});
