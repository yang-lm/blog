var express = require('express')
var swig=require('swig')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var Cookies=require('cookies')

var app=express()

var User=require('./models/user')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/public',express.static(__dirname+'/public'))
app.use('/node_modules',express.static(__dirname+'/node_modules'))


app.engine('html',swig.renderFile)
app.set('views','./views')
app.set('view engine','html')
swig.setDefaults({cache:false})

app.use(function(req,res,next){
	req.cookies=new Cookies(req,res);
	
	req.userInfo={};
	
	//解析登录用户的cookies信息
	if(req.cookies.get('userInfo')){
		try{
			req.userInfo=JSON.parse(req.cookies.get('userInfo'))//这样就可以直接从req.userInfo中获取用户数据
			User.findById(req.userInfo._id).then(function(userInfo){
				req.userInfo.isAdmin=Boolean(userInfo.isAdmin)
				next()
			})
		}catch(err){
			next()
		}
	}
	else{
		next()
	}
	
})

app.use('/admin',require('./routers/admin'))
app.use('/api',require('./routers/api'))
app.use('/',require('./routers/main'))

mongoose.connect('mongodb://localhost:27017/blog',{ useNewUrlParser: true ,useUnifiedTopology: true},function(err){
	if(err){
		console.log('数据库连接失败');
	}
	else{
		console.log('数据连接成功');
		app.listen(3000,'0.0.0.0',function(){
			console.log("running")
		})
	}
})
