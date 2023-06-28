const mongoose=require('mongoose') 

const productschema=mongoose.Schema({
    categoryName:{
        type:String,
        require:true,
    },
    productName:{
        type:String,
        require:true,
    },
    quantity:{
        type:Number,
        require:true,
    },
    productImage:{
        type:Array,
        require:true
    },
    price:{
        type:Number,
        require:true,
    },
    description:{
        type:String,
        require:true
    },
    brand:{
        type:String,
        require:true,
    },
    is_delete:{
        type:Boolean,
        default:false,
    },
    discountPercentage:{
        type:Number,
    },
    discountName:{
        type:String,
    },
})

module.exports=mongoose.model('product',productschema)