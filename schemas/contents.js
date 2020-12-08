var mongoose = require('mongoose')
module.exports=new mongoose.Schema({
	//关联字段-内容分类id
	category:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'Category'
	},
	//用户
	user:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'User'
	},
	//添加时间
	addTime:{
		//类型
		type:Date,
		//引用
		default:new Date()
	},
	views:{
		type:Number,
		default:0
	},
	title:String,
	description:{
		type:String,
		default:''
	},
	content:{
		type:String,
		default:''
	},
	comments:{
		type:Array,
		default:[]
	}
})