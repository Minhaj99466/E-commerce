const express=require('express')
const userRoute=express();
const userController=require('../controller/userController')
const cartController=require('../controller/cartController')
const addressController=require('../controller/addressController')
const wishlistController=require('../controller/wishlistController')
const orderController=require('../controller/orderController')
const couponController=require('../controller/couponController')
const auth= require('../middleware/auth')
const errorHandler=require('../middleware/errorHandler')


userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')


//======================= USER HOME SECTION ============================================= //

userRoute.get('/',userController.loadHome)
userRoute.get('/home',auth.blocked,userController.loadHome)

//======================= SHOP AND SINGLE PRODUCT SECTION =============================== //

userRoute.get('/shop',userController.loadShop)
userRoute.get('/singleProduct/:id', userController.loadSingle)

//======================= USER LOGIN AND REGISTER SECTION(VERIFICATION) ================= //

userRoute.post('/login',userController.verifyLogin)
userRoute.get('/login',auth.isLogout,userController.loadLogin)
userRoute.get('/logout',auth.isLogin,userController.userLogout)
userRoute.get('/register',auth.isLogout,userController.loadRegister) 
userRoute.post('/register',userController.insertUser)
userRoute.get('/verification',userController.loadVerification)
userRoute.post('/verification',userController.verifyEmail)

//======================== USER PROFILE LOAD SECTION ========================= //

userRoute.get('/userProfile',auth.isLogin,userController.loadUserProfile)


//======================== FROGET PASSWORD SECTION ==================== //

userRoute.get('/forget',auth.isLogout,userController.loadForget)
userRoute.post('/forget',userController.forgetVerify)
userRoute.post('/verifyOtp',userController.verifyForgetOtp)
// userRoute.post('/forgetPassword',userController.changePassword)
userRoute.get('/loadchange',userController.loadChangePassword)
userRoute.post('/changePassword',userController.changePassword)

//======================== CART SECTION ==================== //
userRoute.get('/cart',auth.isLogin,cartController.loadCart)
userRoute.post('/addToCart',cartController.addToCart)
userRoute.post('/changeQuantity',auth.isLogin,cartController.changeProductCount)
userRoute.get('/emptyCart',auth.isLogin,cartController.loadEmptyCart)

//======================== CHECKOUT SECTION =============== //

userRoute.get('/checkout',auth.isLogin,cartController.loadCheckout)
userRoute.post('/checkout',orderController.placeOrder)
userRoute.post('/verifyPayment',orderController.verifyPayment);

//======================= ADDRESS SECTION ================= //

userRoute.get('/insertAddress',auth.isLogin,addressController.loadaddAddress)
userRoute.post('/addAddress',auth.isLogin,addressController.insertAddress)
userRoute.get('/delete_Address',auth.isLogin,addressController.deleteAddress)
userRoute.post('/deleteAddress',auth.isLogin,addressController.deleteAddress)
userRoute.get('/editAddress',auth.isLogin,addressController.loadEditAddress);
userRoute.post('/updateAddress',auth.isLogin,addressController.updateAddress)
userRoute.post('/deletecart',cartController.deletecart)
userRoute.get('/address',auth.isLogin,addressController.loadAddress)

//======================= WISHLIST ======================== //

userRoute.get('/wishList',auth.isLogin,wishlistController.wishListLoad)
userRoute.post('/addToWishlist',auth.isLogin,wishlistController.addToWishlist);
userRoute.get('/deleteWishlist',wishlistController.deleteWishlist)

// ====================== FILTER AND SORT SECTION ========= //

userRoute.get('/filterCategory/:id',userController.filterCategory)
userRoute.get('/priceSort/:id',userController.priceSort)

//======================= RETURN/CANCEL ORDER AND VIEW ORDER SECTION ============== //

userRoute.get('/orders',auth.isLogin,orderController.loaduserOrders)
userRoute.get('/viewOrder/:id',auth.isLogin,orderController.loadViewSingleUser)
userRoute.post('/returnOrder',auth.isLogin,orderController.returnOrder)
userRoute.post('/cancelOrder',auth.isLogin,orderController.CancelOrder);
userRoute.get('/orderPlace/:id',orderController.loadOrderPlace);


//======================== INVOICE DOWNLODING ROUTE SECTION START ================= //

userRoute.get('/invoiceDownload/:id',orderController.loadInvoice);

//======================== APPLY COUPON SECTION ============= //

userRoute.post('/applyCoupon',couponController.applyCoupon)

// ======================= ABOUT PAGE LOAD ================= //

userRoute.get('/about',userController.loadAbout)

//======================== ERROR HANDLER USE ================ //

userRoute.use(errorHandler);


module.exports= userRoute