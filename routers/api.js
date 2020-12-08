var express=require('express')
var markdown = require( "markdown" ).markdown;
var router=express.Router()
var User=require('../models/user.js')
var Content=require('../models/Content')

router.use(function(req,res,next){
	responseData={
		code:0,
		message:''
	}
	next();
})

router.post('/user/register',function(req,res,next){
	var username=req.body.username
	var password=req.body.password
	var repassword=req.body.repassword
	if(username==''){
		responseData.code=1;
		responseData.message='用户名不能为空'
		res.json(responseData);
		return;
	}
	if(password==''){
		responseData.code=2;
		responseData.message='密码不能为空'
		res.json(responseData);
		return;
	}
	if(password!=repassword){
		responseData.code=3;
		responseData.message='两次密码不一致'
		res.json(responseData);
		return;
	}
	
	//在数据库中查询用户是否存在
	User.findOne({
		username:username
	}).then(function(userInfo){
		if(userInfo){
			responseData.code=4
			responseData.message='用户已注册'
			res.json(responseData);
			return;
		}
		var user=new User({
			username:username,
			password:password
			});
			return user.save();
			
		
	}).then(function(newUserInfo){
		
		responseData.message='注册成功';
		res.json(responseData)
		return
	})	
})


router.post('/user/login',function(req,res,next){
	var username=req.body.username
	var password=req.body.password
	if(username==''){
		responseData.code=1;
		responseData.message='用户名不能为空'
		res.json(responseData);
		return;
	}
	if(password==''){
		responseData.code=2;
		responseData.message='密码不能为空'
		res.json(responseData);
		return;
	}
	console.log(typeof(username))
	console.log(typeof(password))
	User.findOne({
		username:username,
		password:password
	}).then(function(userInfo){
		if(!userInfo){
			responseData.code=2;
			responseData.message='用户或密码错误'
			res.json(responseData);
			return;
		}
		responseData.message='登录成功';
		responseData.userInfo={
			_id:userInfo._id,
			username:userInfo.username
		}
		req.cookies.set('userInfo',JSON.stringify({
			_id:userInfo._id,
			username:userInfo.username,
		}))
		res.json(responseData);
		return;
	})
	
})
/* 退出 */
router.get('/user/logout',function(req,res){
	req.cookies.set('userInfo',null)
	res.json(responseData)
})

/* 获取文章内容 */
router.get('/content',function(req,res){
	var contentId=req.query.contentid || ''
	Content.findOne({
		_id:contentId
	}).then(function(content){
		responseData.data=markdown.toHTML(content.content)
		res.json(responseData)
	})
	
})

/* 获取指定文章的所有评论 */
router.get('/comment',function(req,res){
	var contentId=req.query.contentid || ''
	Content.findOne({
		_id:contentId
	}).then(function(content){
		responseData.data=content.comments
		res.json(responseData)
	})
})


/* 评论提交 */
router.post("/comment/post",function(req,res){
	var contentId=req.body.contentid || ''
	var postData={
		username:req.userInfo.username,
		postTime:new Date(),
		content:req.body.content
	}
	Content.findOne({
		_id:contentId
	}).then(function(content){
		content.comments.push(postData)
		return content.save();
	}).then(function(newContent){
		responseData.message='评论成功'
		responseData.data=newContent
		res.json(responseData)
	})
})



module.exports=router