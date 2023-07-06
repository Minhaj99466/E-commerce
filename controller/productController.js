const Product = require("../model/productModel");
const User = require("../model/userModel");
const upperCase = require("upper-case");
const Category = require("../model/categoryModel");
const fs =require('fs')
const path=require('path')
const Sharp=require('sharp')
let message = "";

//===================== LOAD PRODUCT =======================//

const loadProduct = async (req, res,next) => {
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
    const product = await Product.find({ is_delete: false });

    res.render("productList", {
      admin: adminData,
      product: product,
      message: message,
    });
  } catch (error) {
    next(error)
  }
};

//======================== LOAD ADD PRODUCT ==================== //

const addProduct = async (req, res,next) => {
  try {
    const category = await Category.find({ is_delete: false });
    const product = await Product.find({ is_delete: false });
    const adminData = await User.findById({ _id: req.session.auser_id });

    res.render("addProduct", {
      category: category,
      products: product,
      admin: adminData,
    });
  } catch (error) {
    next(error)
  }
};

//========================== ADD PRODUCT ========================== //

const insertProduct = async (req, res,next) => {
  try {
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images[i]=req.files[i].filename ;
        await Sharp('./public/adminAssets/adminImage/' +req.files[i].filename)  // added await to ensure image is resized before uploading
        .resize(800, 800)
        .toFile(
          "./public/adminAssets/adminImage/productImage/" + req.files[i].filename
        );
      }
    }
    
    const product = new Product({
      productName: req.body.productName.trim(),
      brand: req.body.brand,
      categoryName: req.body.categoryName,
      description: req.body.description.trim(),
      quantity: req.body.quantity.trim(),
      productImage: images,
      price: req.body.price.trim(),
      discountName:req.body.discountName.trim(),
      discountPercentage:req.body.discountPercentage.trim(),
      expiryDate: req.body.expiryDate.trim()
    });

    console.log(product);

      const productData = await product.save();
      if (productData) {
        res.redirect("/admin/productList");
      
    } else {
      res.redirect("/admin/productList");
    }
  } catch (error) {
    next(error)
  }
};

//======================== DELETE PRODUCT ===================== //

const deleteProduct = async (req, res,next) => {
  try {
    const deleteProduct = await Product.updateOne(
      { _id: req.query.id },
      { $set: { is_delete: true } }
    );
    res.redirect("/admin/productList");
  } catch (error) {
    next(error)
  }
};


// ======================== SHOW EDIT PRODUCT  ===================== //

const editProduct = async (req, res,next) => {
  try {
    const id = req.params.id;
    const productData = await Product.findOne({ _id: id }).populate("categoryName");
    const catData = await Category.find({is_delete: false});
    const adminData = await User.findById({ _id: req.session.auser_id });
    res.render("editProduct", {
      admin: adminData,
      category: catData,
      products: productData,
    });
  } catch (error) {
    next(error)
  }
};

//====================== UPDATE EDIT PRODUCT ====================== //

const updateProduct = async (req, res,next) => {
  if (
    req.body.productName.trim() === "" ||
    req.body.brand.trim() === "" ||
    req.body.categoryName.trim() === "" ||
    req.body.description.trim() === "" ||
    req.body.quantity.trim() === "" ||
    req.body.price.trim() === "" ||
    req.body.discountName.trim() === "" ||
    req.body.discountPercentage.trim() === "" ||
     req.body.expiryDate.trim() === ""
  ) {
    const id = req.params.id;
    const productData = await Product.findOne({ _id: id }).populate("categoryName");
    const categoryData = Category.find();
    const adminData = await User.findById({ _id: req.session.auser_id });
    res.render("editProduct", {
      admin: adminData,
      products: productData,
      message: "All fields required",
      category: categoryData,
    });
  } else {
    try {
      const arrayimg = [];
      for (file of req.files) {
        arrayimg.push(file.filename);
      }
      const id = req.params.id;
      await Product.updateOne(
        { _id: id },
        {
          $set: {
            productName: req.body.productName,
            categoryName: req.body.categoryName,
            quantity: req.body.quantity,
            price: req.body.price,
            description: req.body.description,
            brand: req.body.brand,
            discountPercentage:req.body.discountPercentage,
            discountName:req.body.discountName,      
            expiryDate: req.body.expiryDate
          },
        }
      );
      res.redirect("/admin/productList");
    } catch (error) {
      next(error)
    }
  }
};

//=========================  DELETE IMAGE ======================= //

const deleteimage = async (req, res,next) => {
  try {
    const imgid = req.params.imgid;
    const prodid = req.params.prodid;
    fs.unlink(
      path.join(__dirname, "../public/adminAssets/adminImage", imgid),
      () => {}
    );
    const productimg = await Product.updateOne(
      { _id: prodid },
      { $pull: { productImage: imgid } }
    );
    res.redirect("/admin/editProduct/" + prodid);
  } catch (error) {
    next(error)
  }
};

//============================= UPDATE IMAGE ========================= //

const updateimage = async (req, res,next) => {
  try {
    const id = req.params.id;
    const prodata = await Product.findOne({ _id: id });
    const imglength = prodata.productImage.length;
    const images = [];

    for (let i = 0; i < req.files.length; i++) {
      images[i]=req.files[i].filename ;
      await Sharp('./public/adminAssets/adminImage/' +req.files[i].filename)  // added await to ensure image is resized before uploading
      .resize(800, 800)
      .toFile(
        "./public/adminAssets/adminImage/productImage/" + req.files[i].filename
      );
      }

      if (imglength + images.length <= 10) {
        const updatedata = await Product.updateOne(
          { _id: id },
          { $addToSet: { productImage: { $each: images } } }
        );

        res.redirect("/admin/editProduct/" + id);
      } else {
        const productData = await Product.findOne({ _id: id }).populate(
          "categoryName"
        );
        const adminData = await User.findById({ _id: req.session.Auser_id });
        const categoryData = await Category.find();
        res.render("editProduct", {
          admin: adminData,
          products: productData,
          category: categoryData,
          imgfull: true,
        });
      
    }
  } catch (error) {
    next(error)
  }
}



//---------------- ADMIN OFFER ADDING SECTION START
const addOffer = async(req,res,next)=>{
  try {
      const productId = req.body.id
      const discountPercentage = req.body.discountPercentage
      const discountName = req.body.discountName
      const expiryDate = new Date(req.body.expiryDate)
     
        if (expiryDate < new Date()) {
          await Product.findOneAndUpdate(
            { _id: productId },
            {
              $set: {
                discountName: null,
                discountPercentage: 0,
                expiryDate:null
              }
            },
            { new: true }
          );  
        }else{
          const updateProduct = await Product.findOneAndUpdate(
            { _id: productId },
            {
              $set: {
                discountName: discountName,
                discountPercentage: discountPercentage,
                expiryDate:expiryDate
              }
            },
            { new: true }
          );  
        }
       
       res.redirect("/admin/productList");  

  } catch (error) {
      
  }
}
 

module.exports = {
  loadProduct,
  insertProduct,
  addProduct,
  deleteProduct,
  editProduct,
  updateimage,
  deleteimage,
  updateProduct,
  addOffer
};
