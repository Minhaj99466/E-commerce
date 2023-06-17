const isLogin = async(req,res,next)=>{
    try{
         
   if(req.session.auser_id){
    next();
   }else{
    res.redirect('/admin')
   }
  
    }catch(error){
        console.log(error.message);
    }
}




const islogOut = async(req,res,next)=>{
    try{
  if(req.session.auser_id){
        res.redirect('/admin/home')
  }else{
  next()
}
    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    islogOut
}