
$('#messageBtn').on('click',function(){
	$.ajax({
		type:'post',
		url:'/api/comment/post',
		data:{
			contentid:$('#contentId').val(),
			content:$('#messageContent').val()
		},
		dataType:'json',
		success:function(responseData){
			$('#messageContent').val('');
			renderComment(responseData.data.comments.reverse())
		}
	})
})


function renderComment(comments){
	$('#messageCount').html(comments.length);
	var html='';
	for(var i=0;i<comments.length;i++){
		html+='<div class="messageBox">'+
			'<p class="name clear"><span class="float-left">'+comments[i].username+'</span><span class="float-right">'
			+formatDate(comments[i].postTime)+'</span></p>'		
		+'</div>'+
		'<div class="clearfix"></div>'+
		'<p>'+comments[i].content+'</p>'
	}
	$('.messageList').html(html);
}	

//每次重载时获取该文章的评论

$.ajax({
	url:'/api/comment/',
	data:{
		contentid:$('#contentId').val(),
	},
	dataType:'json',
	success:function(responseData){
		renderComment(responseData.data.reverse());
				
	}
})

function formatDate(d){
	var date1=new Date(d);
	return date1.getFullYear()+'年'+(date1.getMonth()+1)+'月'+date1.getDate()+'日'+
	date1.getHours()+':'+date1.getMinutes()+':'+date1.getSeconds();
	
}