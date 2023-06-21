const mongoose = require('mongoose')

const userSchema=mongoose.Schema({
    name:{
          type:String,
          required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    mobile:{
        type:Number,
        required:true,
    },
    is_admin:{
        type:Number,
        required:true,
    },
    is_block:{
        type:Boolean,
        default:false
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    coupon:{
        type:String,
        default:''
    },
    wallet:{
        type:Number,
        default:0
    }
    
})
module.exports=mongoose.model('user',userSchema)