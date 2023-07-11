const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
let message = "";

//============= SECURE PASSWORD ============== //

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//============== LOGIN PAGE LOAD ===============//

const loadLogin = async (req, res, next) => {
  try {
    res.render("login");
  } catch (error) {
    next(error);
  }
};

//================ VERIFY LOGIN ================//

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;

    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", { message: "email and password incorrect" });
        } else {
          req.session.auser_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "email and password is incorrect" });
    }
  } catch (error) {
    next(error);
  }
};

//=================== DASHBOARD LOAD ===============//

const loadDashboard = async (req, res, next) => {
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
    const productData = await Product.find({ is_delete: false });
    const userData = await User.find({});
    const orderData = await Order.find({});

    const totalSales = await Order.aggregate([
      {
        $match: { "products.status": "Delivered" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    let totalAmount = 0;

    if (totalSales.length > 0) {
      totalAmount += totalSales[0].totalAmount;
      console.log("Total amount of delivered orders:", totalAmount);
    } else {
      console.log("No delivered orders found.");
    }

    const totalCodResult = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: { "products.status": "Delivered", paymentMethod: "COD" },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalCod = 0;
    if (totalCodResult.length > 0) {
      totalCod = totalCodResult[0].totalCodAmount;
    } else {
      console.log("No COD orders found.");
    }

    const totalOnlinePaymentResult = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          paymentMethod: "onlinPayment",
        },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalOnline = 0;
    if (totalOnlinePaymentResult.length > 0) {
      totalOnline = totalOnlinePaymentResult[0].totalCodAmount;
    } else {
      console.log("No online orders found.");
    }

    const totalWalletResult = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          paymentMethod: "walletpayment",
        },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalWallet = 0;
    if (totalWalletResult.length > 0) {
      totalWallet = totalWalletResult[0].totalCodAmount;
    } else {
      console.log("No wallet orders found.");
    }

    res.render("home", {
      admin: adminData,
      product: productData,
      user: userData,
      order: orderData,
      total: totalAmount,
      totalCod,
      totalWallet,
      totalOnline
    });
  } catch (error) {
    next(error);
  }
};

//==================== ADMIN LOGOUT ====================//

const logOut = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

//===================== USER LIST =======================//

const userList = async (req, res, next) => {
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
    const userData = await User.find({ is_admin: 0 });
    res.render("userList", { admin: adminData, user: userData });
  } catch (error) {
    next(error);
  }
};

//======================= USER BLOCK ========================//

const block = async (req, res, next) => {
  try {
    const userData = await User.findByIdAndUpdate(req.query.id, {
      $set: { is_block: true },
    });
    req.session.user = null;
    res.redirect("/admin/userList");
  } catch (error) {
    next(error);
  }
};

//====================== USER UN-BLOCK ======================//

const unblock = async (req, res, next) => {
  try {
    const userData = await User.findByIdAndUpdate(req.query.id, {
      $set: { is_block: false },
    });
    req.session.user = null;
    res.redirect("/admin/userList");
  } catch (error) {
    next(error);
  }
};

const loadSalesReport=async(req,res,next)=>{
  try {
     console.log(req.query.id);
    const adminData = await User.findById(req.session.auser_id);  
    const order = await Order.aggregate([
      { $unwind: "$products" },
     { $match: { 'products.status': {$nin: ['Product Returned', 'waiting for approval'] } }},
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },  
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);

    res.render('salesReport',{admin:adminData,order})
  } catch (error) {
    next(error)
  }
}

const sortReport = async (req, res,next) => {
  try {
    console.log("sdgvshafdghfwaghesdfghsevdfghuwef");
    const adminData = await User.findById({ _id: req.session.auser_id });
    const from =req.body.fromDate
    const to =req.body.toDate
   
   
    
    const order = await Order.aggregate([
      { $unwind: "$products" },
      {$match: { 'products.status': { $ne: 'Product Returned'  },
        $and: [
          { 'date': { $gt:new Date(from) } },
          { 'date': { $lt: new Date(to)} }
        ]
      }},
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },  
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);
    console.log(order)

    res.render("salesReport", { order ,admin:adminData });
   
  } catch (error) {
    next(error)
  }
}


const sortReportFilter = async (req, res,next) => {
  try {
    
    const adminData = await User.findById({ _id: req.session.auser_id });
    var status=req.params.id
    console.log(status,"dxfcgh");
   
    
    const order = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          'products.status': status // Filter based on the product status
        }
      },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },  
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);
    console.log(order)

    res.render("salesReport", { order ,admin:adminData });
   
  } catch (error) {
    next(error)
  }
}



module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logOut,
  userList,
  block,
  unblock,
  loadSalesReport,
  sortReport,
  sortReportFilter
};
