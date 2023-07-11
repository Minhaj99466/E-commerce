const Product = require("../model/productModel");
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");
const User = require("../model/userModel");
const { ObjectId } = require("mongodb");

//===================== LOAD WISHLIST =============== //

const wishListLoad = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    const wishlistData = await Wishlist.find({ user: session }).populate(
      "products.productId"
    );
    const userData = await User.findById({ _id: req.session.user_id });

    if (wishlistData.length > 0) {
      const wishlist = wishlistData[0].products;

      const products = wishlist.map((wish) => wish.productId);
      res.render("wishList", {
        user: session,
        session,
        wishlist,
        products,
        user: userData,
      });
    } else {
      res.render("wishList", {
        user: session,
        session,
        wishlist: [],
        products: [],
        user: userData,
      });
    }
  } catch (error) {
    next(error);
  }
};

//================ ADD TO WISHLIST ================= //

const addToWishlist = async (req, res, next) => {
  try {
    const id = req.body.proId;
    const user = req.session.user_id;
    const userData = await User.findById(user);
    const wishlistData = await Wishlist.findOne({ user: user });

    if (wishlistData) {
      const checkWishlist = await wishlistData.products.findIndex(
        (wish) => wish.productId == id
      );

      if (checkWishlist != -1) {
        res.json({ check: true });
      } else {
        await Wishlist.updateOne(
          { user: req.session.user_id },
          { $push: { products: { productId: id } } }
        );
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
    next(error);
  }
};

//================ DELETE WISHLIST =============== //

const deleteWishlist = async (req, res, next) => {
  try {
    const id = req.query.id;
    const user_id = req.session.user_id;
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: user_id },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/wishList");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  wishListLoad,
  addToWishlist,
  deleteWishlist,
};
