const User=require('../model/userModel')

const isLogin=async(req,res,next)=>{
    try{
        if(req.session.user_id){
            next();
        }else{
            res.redirect('/')
        }
    }catch(error){
        console.log(error.message);
    }
}


const blocked=async(req,res,next)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        console.log(userData);
        if(userData.is_block == false){
            next();
        }else{
            req.session.destroy();
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/home')
        }else{
            next()
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout,
    blocked
}