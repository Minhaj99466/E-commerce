const mongoose= require('mongoose')

const categoryschema= mongoose.Schema({
    categoryName:{
        type:String,
        require:true,
    },
    is_delete:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('category',categoryschema)