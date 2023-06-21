const User = require("../model/userModel");
const bcrypt = require("bcrypt");
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

const loadLogin = async (req, res,next) => {
  try {
    res.render("login");
  } catch (error) {
    next(error)
  }
};

//================ VERIFY LOGIN ================//

const verifyLogin = async (req, res,next) => {
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
    next(error)
  }
};

//=================== DASHBOARD LOAD ===============//

const loadDashboard = async (req, res,next) => {
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
    res.render("home", { admin: adminData });
  } catch (error) {
    next(error)
  }
};

//==================== ADMIN LOGOUT ====================//

const logOut = async (req, res,next) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    next(error)
  }
};

//===================== USER LIST =======================//

const userList = async (req, res,next) => {
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });
    const userData = await User.find({ is_admin: 0 });
    res.render("userList", { admin: adminData, user: userData });
  } catch (error) {
    next(error)
  }
};

//======================= USER BLOCK ========================//

const block = async (req, res,next) => {
  try {
    const userData = await User.findByIdAndUpdate(req.query.id, {
      $set: { is_block: true },
    });
    req.session.user = null;
    res.redirect("/admin/userList");
  } catch (error) {
    next(error)
  }
};

//====================== USER UN-BLOCK ======================//

const unblock = async (req, res,next) => {
  try {
    const userData = await User.findByIdAndUpdate(req.query.id, {
      $set: { is_block: false },
    });
    req.session.user = null;
    res.redirect("/admin/userList");
  } catch (error) {
    next(error)
  }
};



module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logOut,
  userList,
  block,
  unblock,
 
};
