function renderContent(content){
	var html=content;
	
	$('.contentList').html(html);
}	



$.ajax({
	url:'/api/content',
	data:{
		contentid:$('#contentId').val(),
	},
	dataType:'json',
	success:function(responseData){
		renderContent(responseData.data);
				
	}
})