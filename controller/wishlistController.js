const Product = require ('../model/productModel');
const Wishlist = require('../model/wishlistModel');
const Cart = require('../model/cartModel');
const User = require('../model/userModel');
const { ObjectId } = require('mongodb');


//=================== LOAD WISHLIST ================ //

// const wishListLoad = async(req,res)=>{
//     try {
//         const session = req.session.user_id;
//         const users = await User.findOne({_id:req.session.user_id});
//         const wishlistData = await Wishlist.find({user:req.session.user_id}).populate("products.productId");
//         const wish = wishlistData.products;
//         console.log(wish);
//         if(wishlistData){
//             if(wish.length>0){
//                 if(req.session.user_id){
                    
//                     const products = wish.map(wish => wish.products);
//                         res.render("wishList",{
//                             products,
//                             wish,
//                             user:users,
//                             session
//                         })
        
//                 }else{
//                     res.redirect('/');
//                 }
//             }else{
//                 res.render('emptyWishlist');
//             }
//         }else{
//             res.render('emptyWishlist')
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const wishListLoad = async (req, res,next) => {
    try {
      const session = req.session.user_id;
      const wishlistData = await Wishlist.find({ user: session }).populate('products.productId');
      if (wishlistData.length > 0) {
        const wishlist = wishlistData[0].products;
   
        const products = wishlist.map(wish => wish.productId);
        res.render('wishList', {user:session, session, wishlist, products });
      } else {
        res.render('wishList', { user:session,session, wishlist: [], products: [] });
      }
    } catch (error) {
      next(error)
    }
  };
  
//  Adding the Products to Wishlist
// const addToWishlist = async(req,res)=>{
//     try{
//         const proId = req.body.query;
//         const user = await User.findOne({_id:req.session.user_id})
//         const productData = await Product.findOne({_id:proId});
//         const wishlistData = await Wishlist.findOne({user:req.session.user_id});
//         if(wishlistData){
//             const checkWishlist = await wishlistData.products.findIndex((wish)=> wish.productId == proId);
        
//             if(checkWishlist != -1){
//                 res.json({check:true})
//             }else{
//                 await Wishlist.updateOne({user:req.session.user_id},{$push:{products:{productd:proId}}});
//                 res.json({success:true});
//             }
//         }else{
//             const wishlist = new Wishlist({
//                 user:req.session.user_id,
//                 userName:user.name,
//                 products:[{
//                     productId:productData._id
//                 }]
//             })

//             const wish = await wishlist.save();
            
//             if(wish){
//                 res.json({success:true});
//             }
//         }
//     }catch(error){
//         console.log(error.message);
//     }
// }



const addToWishlist = async (req, res,next) => {
    try {
      const id = req.body.proId;
      const user = req.session.user_id
      const userData = await User.findById(user)
      const wishlistData = await Wishlist.findOne({ user:user });
  
      if (wishlistData) {
        const checkWishlist = await wishlistData.products.findIndex((wish) => wish.productId == id);

        if (checkWishlist != -1) {
          res.json({ check: true });
        } else {
          await Wishlist.updateOne({ user: req.session.user_id }, { $push: { products: { productId: id } } });
          res.json({ success: true });
        }
      } else {
        const wishlist = new Wishlist({
          user: req.session.user_id,
          userName: userData.name, 
          products: [
            {
              productId: id,
            },
          ],
        });
  
        const wish = await wishlist.save();
        if (wish) {
          res.json({ success: true });
        }
      }
    } catch (error) {
      next(error)
    }
  };
  
  const deleteWishlist = async (req, res,next) => {
    try {
      const id = req.query.id;
      const user_id = req.session.user_id;
      const updatedWishlist = await Wishlist.findOneAndUpdate(
        {user:user_id},
        { $pull: { products: { productId: id } } }
      );
      res.redirect('/wishList');
    } catch (error) {
      next(error)
    
    }
  };

module.exports={
    wishListLoad,
    addToWishlist,
    deleteWishlist
}