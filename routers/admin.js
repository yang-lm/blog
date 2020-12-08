var express=require('express')

var router=express.Router()
var User=require('../models/user')
var Category=require('../models/Category')
var Content=require('../models/Content')

router.use(function(req,res,next){
	if(!req.userInfo.isAdmin){
		res.send('对不起，只有管理员才可以进入后台管理')
	}
	next()
})

router.get('/',function(req,res,next){
	res.render('admin/index',{
		userInfo:req.userInfo
	});
})
/* 用户管理 */
router.get('/user',function(req,res,next){
	/* 读取数据库中的数据 
	limit(Number):限制获取的数据条目
	skip(2):忽略掉数据的条数
	*/
   var page=Number(req.query.page||1);
   var limit=4;
   var pages=0;
   
   User.countDocuments().then(function(count){//获取数据条数
	   pages=Math.ceil(count/limit);
	   page=Math.min(page,pages);
	   page=Math.max(page,1);
	   var skip=(page-1)*limit
	   //sort({_id:-1})按照id日期降序排序
	   User.find().sort({_id:-1}).limit(limit).skip(skip).then(function(users){
	   	res.render('admin/user_index',{
	   		users:users,
	   		page:page,
			count:count,
			pages:pages,
			limit:limit,
			url:'/admin/user',
			userInfo:req.userInfo
			
	   	})
	   })
   })
	
	
})

/* 分类首页 */
router.get('/category',function(req,res){
	// res.render('admin/category_index',{
	// 	userInfo:req.userInfo,
	// })
	var page=Number(req.query.page||1);
	var limit=4;
	var pages=0;
	
	Category.countDocuments().then(function(count){
		   pages=Math.ceil(count/limit);//计算页数
		   page=Math.min(page,pages);
		   page=Math.max(page,1);
		   var skip=(page-1)*limit
		   Category.find().limit(limit).skip(skip).then(function(categories){
		   	res.render('admin/category_index',{
				categories:categories,
				page:page,
				count:count,
				pages:pages,
				limit:limit,
				url:'/admin/category',
				userInfo:req.userInfo
				
		   	})
		   })
	})
})
/* 添加分类 */
router.get('/category/add',function(req,res){
	res.render('admin/category_add',{
		userInfo:req.userInfo
	})
})
router.post('/category/add',function(req,res){
	var name=req.body.name||'';
	if(name==''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'名称不能为空'
		})
		return
	}
	//查看数据库中分类是否已存在
	Category.findOne({
		name:name
	}).then(function(rs){
		if(rs){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类已存在'
			})
			return Promise.reject();//不再执行下面then
		}else{
			return new Category({
				name:name
			}).save();
		}
	}).then(function(newCategory){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'添加成功',
			url:'/admin/category'
		})
	})
})

/* 分类修改 */
router.get('/category/edit',function(req,res){
	var id=req.query.id||'';
	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			console.log()
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
		}else{
			res.render('admin/category_edit',{
				userInfo:req.uerInfo,
				category:category
			})
		}
	})
})
/* 分类的修改保存 */
router.post('/category/edit',function(req,res){
	var id=req.query.id||'';//是跳转链接携带过来的
	var name=req.body.name
	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			console.log()
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'分类信息不存在'
			})
			return Promise.reject()
		}else{
			if(name==category.name){
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'修改成功',
					url:'/admin/category'
				})
				return Promise.reject()
			}else{
				return Category.findOne({
					_id:{$ne:id},//当前id
					name:name
				})
			}
		}
	}).then(function(sameCategory){
		if(sameCategory){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'数据库中已存在同名分类'
			})
			return Promise.reject()
		}else{
			return Category.update({
				_id:id
			},{name:name})
		}
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'修改成功',
			url:'/admin/category'
		})
	})
	
})



/* 分类删除 */
router.get('/category/delete',function(req,res){
	var id=req.query.id||'';
	Category.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'删除成功',
			url:'/admin/category'
		})
	})
})
/* 内容首页 */
router.get('/content',function(req,res){
	var page=Number(req.query.page||1);
	var limit=4;
	var pages=0;
	
	Content.countDocuments().then(function(count){
		  
		   pages=Math.ceil(count/limit);//计算页数
		   page=Math.min(page,pages);
		   page=Math.max(page,1);
		   var skip=(page-1)*limit
		   Content.find().limit(limit).skip(skip).sort({addTime:-1}).populate(['category','user']).then(function(contents){
			res.render('admin/content_index',{
				contents:contents,
				page:page,
				count:count,
				pages:pages,
				limit:limit,
				url:'/admin/content',
				userInfo:req.userInfo
				
		   	})
		   })
	})
})
/* 添加内容 */
router.get('/content/add',function(req,res){
	Category.find().sort({_id:-1}).then(function(categories){
		Category.find().then(function(rs){
			res.render('admin/content_add',{
				userInfo:req.userInfo,
				categories:rs,
			})
		})
	})
	
})

/* 内容提交 */
router.post('/content/add',function(req,res){
	if(req.body.category==''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容分类不能为空'
		})
		return;
	}
	if(req.body.title==''){
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'内容标题不能为空'
		})
		return;
	}
	new Content({
		category:req.body.category,
		title:req.body.title,
		user:req.userInfo._id.toString(),
		description:req.body.description,
		content:req.body.content,
		
	}).save().then(function(rs){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'内容保存成功',
			url:'/admin/content'
		})
	})
})
/* 内容编辑 */
router.get('/content/edit',function(req,res){
	var id=req.query.id||'';
	var rs={}
	Category.find().sort({_id:-1}).then(function(categories){
		rs=categories
		return Content.findOne({
			_id:id
		}).populate('category')
	}).then(function(content){
		if(!content){
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'内容分类不能为空'
			})
			return Promise.reject()
		}else{
			 
			res.render('admin/content_edit',{
				userInfo:req.userInfo,
				categories:rs,
				content:content
			})
		}		
	})
})
/* 保存内容 */
router.post('/content/edit',function(req,res){
	var id=req.query.id
    var content=req.body
	if(content.title==''){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'标题不能为空',
			url:'/admin/content'
		})
		return;
	}
	Content.update({_id:id},{
		category:content.category,
		title:content.title,
		description:content.description,
		content:content.content
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'内容保存成功',
			url:'/admin/content/edit?id='+id,
		})
	})
})
/* 删除内容 */
router.get('/content/delete',function(req,res){
	var id=req.query.id||''
	
	Content.remove({
		_id:id
	}).then(function(){
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'删除成功',
			url:'/admin/content'
		})
	})
})

module.exports=router