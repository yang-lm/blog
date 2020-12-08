var express=require('express')
var markdown = require( "markdown" ).markdown
var router=express.Router()
var Category=require('../models/Category')
var Content=require('../models/Content')

router.use(function(req,res,next){
	where={}
	data={
		userInfo:req.userInfo,
		categories:[],
	};
	Category.find().then(function(categories){
		data.categories=categories
	})
	next()
})

/* 首页 */
router.get('/',function(req,res,next){
	//读取所有分类信息
	data.category=req.query.category||'', 
	data.count=0,
	data.page=Number(req.query.page||1),
	data.limit=3,
	data.pages=0,
	data.url="/"
	data.category=req.query.category||''
	//读取分类信息
	if(data.category){
		where.category=data.category
	}
	
	
	Content.where(where).count().then(function(count){
		data.count=count
		data.pages=Math.ceil(data.count/data.limit);
		data.page=Math.min(data.page,data.pages)
		
		data.page=Math.max(data.page,1)
		var skip =(data.page-1)*data.limit
		
		return Content.find().where(where).sort({addTime:-1}).limit(data.limit).skip(skip).populate(['category','user'])
	
	}).then(function(contents){
		data.contents=contents;
		
		res.render('main/index',data)
	})
})
	
	

/* 阅读 */
router.get('/view',function(req,res){
	var contentId=req.query.contentId || ''
	Content.findOne({
		_id:contentId
	}).populate(['category','user']).then(function(content){
		content.views++;
		content.save();
		data.content=content;
		
		res.render('main/view',data);
	})
	
})

module.exports=router