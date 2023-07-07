const mongoose = require('mongoose');

const coupenSchema = mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    discountType:{
        type:String,
        required:true
    },
    discountPercentage:{
        type:Number
    },
    user:{
        type:Array,
        ref:"User",
    },
    status:{
        type:Boolean,
        default:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    is_couponValied:{
        type:Boolean,
        default:false,
    }
})

const coupon = mongoose.model('coupon', coupenSchema);

module.exports = coupon;