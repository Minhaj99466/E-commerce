const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Address = require("../model/addressModel");

//=================== LOAD CART ======================//

const loadCart = async (req, res, next) => {
  try {
    let id = req.session.user_id;
    const session = req.session.user_id;
    let userName = await User.findOne({ _id: req.session.user_id });
    let cartData = await Cart.findOne({ userId: req.session.user_id }).populate(
      "products.productId"
    );
    if (req.session.user_id) {
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
          const total = await Cart.aggregate([
            { $match: { userId: req.session.user_id } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$products.productPrice", "$products.count"],
                  },
                },
              },
            },
          ]);
          const Total = total.length > 0 ? total[0].total : 0;
          const totalAmount = Total ;
          const userId = userName._id;
          const userData = await User.find({});
          res.render("cart", {
            products: products,
            Total: Total,
            userId,
            session,
            totalAmount,
            user: userName,
          });
        } else {
          res.render("emptyCart", {
            user: userName,
            session,
            message: "No Products Added to cart",
          });
        }
      } else {
        res.render("emptyCart", {
          user: userName,
          session,
          message: "No Products Added to cart",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};

//====================== ADD TO CART ==================//

const addToCart = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findOne({ _id: userId });
    const proId = req.body.id;
    const productData = await Product.findOne({ _id: proId });
    const productQuantity = productData.quantity;
    const cartData = await Cart.findOneAndUpdate(
      { userId: userId },
      {
        $setOnInsert: {
          userId: userId,
          userName: userData.name,
          products: [],
        },
      },
      { upsert: true, new: true }
    );
    const updatedProduct = cartData.products.find(
      (product) => product.productId === proId
    );
    const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
    if (updatedQuantity + 1 > productQuantity) {
      return res.json({
        success: false,
        message: "Quantity limit reached!",
      });
    }
    const cartProduct = cartData.products.find(
      (products) => products.productId === proId
    );

    const discount =  productData.discountPercentage;          
    const price =  productData.price 
    const discountAmount = Math.round((price*discount)/100)
    const total = price - discountAmount

    if (cartProduct) {
      await Cart.updateOne(
        { userId: userId, "products.productId": proId },
        {
          $inc: {
            "products.$.count": 1,
            "products.$.totalPrice": total,
          },
        }
      );
    } else {
      cartData.products.push({
        productId: proId,
        productPrice:total,
        totalPrice: total,
      });
      await cartData.save();
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//================== INCREASE + AND DECREASING - THE COUNT OF THE PRODUCT =====================//

const changeProductCount = async (req, res, next) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
    const cartData = await Cart.findOne({ userId: userData });
    const product = cartData.products.find(
      (product) => product.productId === proId
    );
   
    const productData = await Product.findOne({ _id: proId });
    const productQuantity = productData.quantity;

    const updatedCartData = await Cart.findOne({ userId: userData });
    const updatedProduct = updatedCartData.products.find(
      (product) => product.productId === proId
    );
    const updatedQuantity = updatedProduct.count;

    if (count > 0) {
      // Quantity is being increased
      if (updatedQuantity + count > productQuantity) {
        res.json({ success: false, message: "Quantity limit reached!" });
        return;
      }
    } else if (count < 0) {
      // Quantity is being decreased
      if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
        await Cart.updateOne(
          { userId: userData },
          { $pull: { products: { productid: proId } } }
        );
        res.json({ success: true });
        return;
      }
    }

    const cartdata = await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $inc: { "products.$.count": count } }
    );

    const updateCartData = await Cart.findOne({ userId: userData });
    const updateProduct = updateCartData.products.find(
      (product) => product.productId === proId
    );
    const updateQuantity = updateProduct.count;

    const discount =  productData.discountPercentage;          
    const price =  productData.price 
    const discountAmount = Math.round((price*discount)/100)
    const total = price - discountAmount
    const prices = updateQuantity * total;

    await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $set: { "products.$.totalPrice": prices } }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//======================= LOAD CART =====================//

const loadEmptyCart = async (req, res, next) => {
  try {
    const session = req.session.user_id;

    if (!session) {
      return res.render("emptyCart", { session: session });
    }

    const userData = await User.findById({ _id: req.session.user_id });
    if (userData) {
      return res.render("emptyCart", { user: userData, session });
    } else {
      const session = null;
      return res.render("emptyCart", { session });
    }
  } catch (error) {
    next(error);
  }
};



//===================== LOAD CHECKOUT ======================//

const loadCheckout = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const addressData = await Address.findOne({ userId: req.session.user_id });
    const total = await Cart.aggregate([
      { $match: { userId: req.session.user_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$products.productPrice", "$products.count"] },
          },
        },
      },
    ]);

    if (req.session.user_id) {
      if (addressData) {
        if (addressData.addresses.length > 0) {
          const address = addressData.addresses;
          const Total = total.length > 0 ? total[0].total : 0;
          const totalAmount = Total ;
          res.render("checkout", {
            session,
            Total,
            address,
            totalAmount,
            user: userData,
          });
        } else {
          const address = addressData.addresses;
          const Total = total.length > 0 ? total[0].total : 0;
          const totalAmount = Total ;
          res.render("checkout", {
            
            session,
            Total,
            address,
            totalAmount,
            user: userData,
          });
        }
      } else {
        const address = addressData.addresses;
        const Total = total.length > 0 ? total[0].total : 0;
        const totalAmount = Total ;
        res.render("checkout", {
          session,
            Total,
            address,
            totalAmount,
            user: userData,
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//===================== DELETE CART ================= //

const deletecart = async (req, res, next) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    const cartData = await Cart.findOne({ userId: userData });
    if (cartData.products.length === 1) {
      const c = await Cart.deleteOne({ userId: userData });
      console.log(c);
    } else {
      const v = await Cart.updateOne(
        { userId: userData },
        { $pull: { products: { productId: proId } } }
      );
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  loadCart,
  addToCart,
  changeProductCount,
  loadEmptyCart,
  loadCheckout,
  deletecart,
};
