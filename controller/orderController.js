const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const Order = require("../model/orderModel");
const Cart = require("../model/cartModel");
const razorpay = require("razorpay");
const path = require('path')
const fs = require('fs')
const  puppeteer = require('puppeteer')
const ejs = require('ejs')

var instance = new razorpay({
  key_id: process.env.Razorpay_Key_Id,
  key_secret: process.env.Razorpay_Key_Secret,
});

const placeOrder = async (req, res, next) => {
  try {
    const id = req.session.user_id;
    const userName = await User.findOne({ _id: id });
    const address = req.body.address;
    const paymentMethod = req.body.payment;
    const cartData = await Cart.findOne({ userId: id });
    const products = cartData.products;
    const Total = parseInt(req.body.Total);

    const status = paymentMethod === "COD" ? "placed" : "pending";
    const order = new Order({
      deliveryAddress: address,
      userId: id,
      userName: userName.name,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount: Total,
      date: new Date(),
      status: status,

    });
    const orderData = await order.save();
    if (orderData) {
      for (let i = 0; i < products.length; i++) {
        const count = products[i].count;
        const pro = products[i].productId;
        await Product.findByIdAndUpdate(
          { _id: pro },
          { $inc: { quantity: -count } }
        );
      }
      if (order.status === "placed") {
        await Cart.deleteOne({ userId: id });
        res.json({ codsuccess: true });
      } else {
        if(paymentMethod==='walletpayement'){
          const wallet = userName.wallet
          if(wallet >= Total){
            await Cart.deleteOne({ userId: req.session.user_id });
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].productId;
              const count = products[i].count;
              await Product.findByIdAndUpdate({ _id: pro }, { $inc: { quantity: -count } });
              await User.findOneAndUpdate({_id:req.session.user_id},{$inc:{wallet: -Total}})
              await Order.findOneAndUpdate({_id:order._id},{$set:{status:"placed"}});
              res.json({ codsuccess: true });
        }
      }else{
        res.json({walletFailed:true});
      }
    }else{
        const orderId = orderData._id;
        const totalAmount = orderData.totalAmount;
        var options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "" + orderId,
        };

        instance.orders.create(options, function (err, order) {
          res.json({ order });
        });
      }
    }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const details = req.body;

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.Razorpay_Key_Secret);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");

    if (hmacValue === details.payment.razorpay_signature) {
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await Cart.deleteOne({ userId: req.session.user_id });
      res.json({ success: true });
    } else {
      await Order.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (err) {
    next(err);
  }
};

//======================= LOAD ADMIN ORDERS  =========================== //

const loadAdminOrders = async (req, res, next) => {
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
    const orders = await Order.find().populate("products.productId").sort({date:1});
    if (orders.length > 0) {
      res.render("order", { admin: adminData, orders: orders });
    } else {
      res.render("order", { admin: adminData, orders: [] });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//======================= LOAD ADMIN SINGLE ORDERS  =========================== //

const loadSingleOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const adminData = await User.findById({ _id: req.session.auser_id });
    const orderData = await Order.findOne({_id:id}).populate("products.productId");

      res.render("singleOrder", { admin: adminData, orders: orderData });
   
  } catch (error) {
    console.log(error.message);
  }
};

// ================ CHANGE STATUS OR FLOW OF ORDER CHANGE =============

const changeStatus = async(req,res) =>{
  try {
    const id = req.body.id
    const userId = req.body.userId
    const statusChange = req.body.status
    
    
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: userId,
        'products._id': id,
      },
      {
        $set: {
          'products.$.status': statusChange,
        },
      },
      { new: true }
    );
    if(statusChange==="Delivered"){
     await Order.findOneAndUpdate(
        {
          userId: userId,
          'products._id': id,
        },
        {
          $set: {
            'products.$.deliveryDate': new Date(),
          },
        },
        { new: true }
      );
    }
    console.log(updatedOrder+"sdfghjfdfggjlhgh");

    if(updatedOrder){
      res.json({success:true})
    }
  } catch (error) {
    console.log(error.message);
  }
}

//======================================  LOAD ORDERS ========================================//

const loaduserOrders = async (req, res,next) => {
  try {
   
    if (req.session.user_id) {
      const session = req.session.user_id;
      const id = req.session.user_id;
      const userdata = await User.findById({ _id: req.session.user_id });
      const orderData = await Order.find({userId:id}).populate("products.productId");
      
      res.render("orders", { user: userdata, session ,orders:orderData});
    } else {
      const session = null;
      res.redirect("/home", { message: "please login" });
    }
  } catch (error) {
    next(error)
  }
};

//======================== LOAD SINGLE ORDER USER SIDE =================

const loadViewSingleUser = async (req,res)=> {
  try {
    const id = req.params.id;
    const session =req.session.user_id
    const userdata = await User.findOne({_id: session})
    const orders = await Order.findOne({_id:id}).populate("products.productId")
  
    res.render("viewOrder",{session,user:userdata,orders:orders})
  } catch (error) {
    console.log(error.message);
  }
}

// ================== RETURN ORDER ==================

const returnOrder = async(req,res) =>{
  try {
    const ordersId = req.body.ordersid;
    const Id = req.session.user_id
    const id = req.body.orderid;
    const reason = req.body.reason
    const userData = await User.findById(Id)
    const orderData = await Order.findOne({ userId: Id, 'products._id': id})
    const product = orderData.products.find((Product) => Product._id.toString() === id);
    const returnAmount = product.totalPrice
    const proCount = product.count
    const proId = product.productId 
    
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: Id,
        'products._id': id
      },
      {
        $set: {
          'products.$.status': 'Product Returned',
          'products.$.returnReason': reason
        }
      },
      { new: true }
    );

    if(updatedOrder){

      await Product.findByIdAndUpdate({_id:proId},{$inc:{StockQuantity:proCount}})
      await User.findByIdAndUpdate({_id:Id},{$inc:{wallet:returnAmount}})
      res.redirect("/vieworder/" + ordersId)
    }else{
       res.redirect("/vieworder/" + ordersId)
    }
   

  } catch (error) {
    console.log(error.message);
  }
}


//======================== CANCEL ORDER =====================

const CancelOrder = async (req, res) => {
  try {
    const id = req.body.orderid;
    const reason = req.body.reason
    const ordersId = req.body.ordersid;
    const Id = req.session.user_id
    const userData = await User.findById(Id)
    const orderData = await Order.findOne({ userId: Id, 'products._id': id})
    const product = orderData.products.find((Product) => Product._id.toString() === id);
    const cancelledAmount = product.totalPrice
    const proCount = product.count
    const proId = product.productId   
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: Id,
        'products._id': id
      },
      {
        $set: {
          'products.$.status': 'cancelled',
          'products.$.cancelReason': reason
        }
      },
      { new: true }
    );


    if (updatedOrder) {
         await Product.findByIdAndUpdate({_id:proId},{$inc:{quantity:proCount}})
      if(orderData.paymentMethod === 'onlinePayment' || orderData.paymentMethod === 'Wallet'){
         await User.findByIdAndUpdate({_id:Id},{$inc:{wallet:cancelledAmount}})
        //  await ordermodel.findByIdAndUpdate({_id:Id},{$inc:{totalAmount:-cancelledAmount}})

        await ordermodel.findByIdAndUpdate(Id, { $inc: { totalAmount: -cancelledAmount } });

         res.redirect("/vieworder/" + ordersId)
      }else{
        res.redirect("/vieworder/" + ordersId)
      }
    } else {
      res.redirect("/vieworder/" + ordersId)
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadInvoice=async (req, res) => {
  try {
    const id = req.params.id;
    const session = req.session.user_id;
    const userData = await User.findById({_id:session})
    const orderData = await Order.findOne({_id:id}).populate('products.productId');
   
    const date = new Date()
   
     data = {
      order:orderData,
      user:userData,
      date,
    }
    

    const filepathName = path.resolve(__dirname, '../views/users/invoice.ejs');
   
    const html = fs.readFileSync(filepathName).toString();
    console.log(html,"//////////////////////////////////////////////");
    const ejsData = ejs.render(html, data);
    
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: 'networkidle0' });
    const pdfBytes = await page.pdf({ format: 'Letter' });
    await browser.close();

   
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename= order invoice.pdf');
    res.send(pdfBytes);

  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

// const Invoice=async(req,res)=>{
// try {
//   const session = req.session.user_id;
//     const userData = await User.findById({_id:session})
//   const orderData = await Order.findOne();
//   const date = new Date()
   
//      data = {
//       order:orderData,
//       user:userData,
//       date,
//     }

//   res.render('invoice',{order:orderData,user:userData,date:date})
// } catch (error) {
//   console.log(error.message);
// }
// }



module.exports = {
  placeOrder,
  verifyPayment,
  loadAdminOrders,
  loadSingleOrder,
  changeStatus,
  loaduserOrders,
  loadViewSingleUser,
  returnOrder,
  CancelOrder,
  loadInvoice,
 // Invoice
};
