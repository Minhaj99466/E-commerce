const express = require("express");
const adminRoute = express();
const auth = require("../middleware/adminauth");
const adminController = require("../controller/adminController");
const categoryController = require("../controller/categoryController");
const productController = require("../controller/productController");
const orderController = require("../controller/orderController");
const bannerController = require("../controller/bannerController");
const couponController = require("../controller/couponController");
const multer = require("multer");
const update = require("../config/multconfig");

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

//=================== ADMIN DASH BOARD AND HOME =============//

adminRoute.get("/", auth.islogOut, adminController.loadLogin);
adminRoute.post("/", adminController.verifyLogin);
adminRoute.get("/home", auth.isLogin, adminController.loadDashboard);
adminRoute.get("/logout", auth.isLogin, adminController.logOut);

//=================== ADMIN USERLIST AND BLOCK & UN-BLOCK============= //

adminRoute.get("/userlist", auth.isLogin, adminController.userList);
adminRoute.get("/block-user", auth.isLogin, adminController.block);
adminRoute.get("/unblock-user", auth.isLogin, adminController.unblock);

// ================== ADMIN CATEGORY SECTION =========================== //

adminRoute.get("/category", auth.isLogin, categoryController.loadCategory);
adminRoute.post("/category", categoryController.addCategory);
adminRoute.get("/editCategory",auth.isLogin,categoryController.loadEditCategory);
adminRoute.post("/editCategory", categoryController.updateCategory);
adminRoute.get("/deleteCategory",auth.isLogin,categoryController.deleteCategory);

//====================== ADMIN PRODUCT SECTION ==================== //

adminRoute.get("/productList", auth.isLogin, productController.loadProduct);
adminRoute.get("/addProduct", auth.isLogin, productController.addProduct);
adminRoute.post("/addProduct",update.upload.array("image", 10),productController.insertProduct);
adminRoute.get("/deleteProduct", auth.isLogin, productController.deleteProduct);
adminRoute.get("/editProduct/:id", auth.isLogin, productController.editProduct);
adminRoute.get("/deleteimg/:imgid/:prodid",auth.isLogin,productController.deleteimage);
adminRoute.post("/addproduct",update.upload.array("image", 10),productController.insertProduct);
adminRoute.post("/editProduct",update.upload.array("image", 10),productController.updateProduct);
adminRoute.post("/editProduct/updateimage/:id",update.upload.array("image"),productController.updateimage);

//======================= ADMIN ORDER SECTION ==================== //

adminRoute.get("/orders", auth.isLogin, orderController.loadAdminOrders);
adminRoute.get("/vieworder/:id", auth.isLogin, orderController.loadSingleOrder);
adminRoute.post("/updateStatus", auth.isLogin, orderController.changeStatus);

//======================= SALES REPORT SECTION ======================== //

adminRoute.get("/salesReport", auth.isLogin, adminController.loadSalesReport);
adminRoute.post("/salesReportSort", auth.isLogin, adminController.sortReport);
adminRoute.get("/salesReportSort/:id",auth.isLogin,adminController.sortReportFilter);

adminRoute.post("/returnOrderApproval",auth.isLogin,orderController.returnOrderApproval);

//========== BANNER MANAGEMENT and OFFER============================ //

adminRoute.get("/banner", auth.isLogin, bannerController.loadBannerManagement);
adminRoute.post("/addbanner",update.upload.single("image"),auth.isLogin,bannerController.addBanner);
adminRoute.post("/editBanner",update.upload.single("image"),auth.isLogin,bannerController.editBanner);
adminRoute.post("/addOffer", productController.addOffer);

//---------------- COUPONLIST ROUTE SECTION START ======================== //

adminRoute.get("/couponList", auth.isLogin, couponController.loadCopon);
adminRoute.post("/addCoupon", couponController.addCoupon);
adminRoute.post("/editCoupon/:id", couponController.editCoupon);
adminRoute.post("/deleteCoupon", auth.isLogin, couponController.deleteCoupon);

adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = adminRoute;
