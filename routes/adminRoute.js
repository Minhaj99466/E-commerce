const express = require("express");
const adminRoute = express();

const auth = require("../middleware/adminauth");
const adminController = require("../controller/adminController");
const categoryController = require("../controller/categoryController");
const productController = require("../controller/productController");
const multer = require("multer");
const update = require("../config/multconfig");




adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

adminRoute.get("/", auth.islogOut, adminController.loadLogin);
adminRoute.post("/", adminController.verifyLogin);

adminRoute.get("/home", auth.isLogin, adminController.loadDashboard);

adminRoute.get("/logout", auth.isLogin, adminController.logOut);

adminRoute.get("/userlist", auth.isLogin, adminController.userList);
adminRoute.get("/block-user", auth.isLogin, adminController.block);
adminRoute.get("/unblock-user", auth.isLogin, adminController.unblock);

adminRoute.get("/category", auth.isLogin, categoryController.loadCategory);
adminRoute.post("/category", categoryController.addCategory);

adminRoute.get(
  "/editCategory",
  auth.isLogin,
  categoryController.loadEditCategory
);
adminRoute.post("/editCategory", categoryController.updateCategory);

adminRoute.get(
  "/deleteCategory",
  auth.isLogin,
  categoryController.deleteCategory
);

adminRoute.get("/productList", auth.isLogin, productController.loadProduct);
adminRoute.get("/addProduct", auth.isLogin, productController.addProduct);
adminRoute.post("/addProduct",update.upload.array("image", 10),productController.insertProduct);

adminRoute.get("/deleteProduct", auth.isLogin, productController.deleteProduct);
adminRoute.get("/editProduct/:id", auth.isLogin, productController.editProduct);
adminRoute.get('/deleteimg/:imgid/:prodid',auth.isLogin,productController.deleteimage);

adminRoute.post('/addproduct',update.upload.array('image',10),productController.insertProduct);
adminRoute.post('/editProduct/:id',update.upload.array('image',10),productController.updateProduct)
adminRoute.post("/editProduct/updateimage/:id",update.upload.array('image'),productController.updateimage)


adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = adminRoute;
