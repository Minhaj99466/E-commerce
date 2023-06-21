const User = require("../model/userModel");

const bcrypt = require("bcrypt");
const config = require("../config/config");

const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const nodeMailer = require("nodemailer");
const randomstring = require("randomstring");
const Address = require("../model/addressModel");
let otp;
let email;
let otp3;
let emalreset;

//======================= PASSWORD SECURING =====================//


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//======================== VERIFY LOGIN =========================//

const verifyLogin = async (req, res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_verified === true) {
          if (userData.is_block) {
            res.render("login", { message: "This email is blocked by admin" });
            return;
          }
          req.session.user_id = userData._id;
          res.redirect("/home");
        } else {
          res.render("login", { message: "email and password incorrect" });
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

//=========================== LOAD HOME ==============================//

const loadHome = async (req, res,next) => {
  try {
    const session = req.session.user_id;
    if (!session) {
      return res.render("home", { session: session });
    }
    const userData = await User.findById({ _id: req.session.user_id });

    if (userData) {
      return res.render("home", { user: userData, session });
    } else {
      const session = null;
      return res.render("home", { session });
    }
  } catch (error) {
    next(error)
  }
};

//============================  LOGIN PAGE LOAD ========================//

const loadLogin = async (req, res,next) => {
  try {
    res.render("login");
  } catch (error) {
    next(error)
  }
};

//============================= REGISTRATION PAGE LOAD ==================//

const loadRegister = async (req, res,next) => {
  try {
    res.render("register");
  } catch {
    next(error)
  }
};

//============================= USER REGISTER SAVE/INSERT USER ========================//

const insertUser = async (req, res,next) => {
  try {
    const spassword = await securePassword(req.body.password);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: spassword,
      is_admin: 0,
    });

    email = user.email;
    const name = req.body.name;

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      res.render("register", { message: "email already registered" });
    } else {
      const userData = await user.save();
      if (userData) {
        randomnumber = Math.floor(Math.random() * 9000) + 1000;
        otp = randomnumber;

        sendverifyMail(name, req.body.email, randomnumber);
        res.redirect("/verification");
      } else {
        res.render("register", {
          message: "your registeration has been failled",
        });
      }
    }
  } catch (error) {
    next(error)
  }
};

//======================================== USER LOGOUT =============================//

const userLogout = async (req, res,next) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    next(error)
  }
};



//============================ LOAD SHOP ====================================//



const loadShop = async (req,res,next)=>{
  try {
     var search = '';
    if(req.query.search){
      search = req.query.search;
    }

    var page = 1;
    if(req.query.page){
      page = req.query.page;
    }

    const limit = 6;
    
    const session = req.session.user_id;
    const productData = await Product.find({is_delete:false,
        $or:[
          {productName:{$regex:'.*'+search+'.*',$options:'i'}},
          {categoryName:{$regex:'.*'+search+'.*',$options:'i'}},
          // {description:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
      })
      .limit(limit * 1)
      .skip((page-1) * limit ) 
      .exec()

      const count = await Product.find({is_delete:false,
        $or:[
          {productName:{$regex:'.*'+search+'.*',$options:'i'}},
          {categoryName:{$regex:'.*'+search+'.*',$options:'i'}},
          // {description:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
      })
      .countDocuments();

      
      const categoryData = await Category.find({is_delete:false});
      
      
      if (!session) {
        return res.render("shop",{session:session,category:categoryData,product:productData,   
          totalPages:Math.ceil(count/limit),currentPage:page});
      }
  
      const userData = await User.findById({_id:req.session.user_id});
      if (userData) {
        return res.render("shop", {user:userData,session,category:categoryData,product:productData,
          totalPages:Math.ceil(count/limit),currentPage:page});
      } else {
        const session = null
        return res.render("shop",{session,category:categoryData,product:productData,
          totalPages:Math.ceil(count/limit),currentPage:page});
      }
    } catch (error) {
      next(error)
    }
}



//================================ LOAD VERIFICATION ==============================//

const loadVerification = async (req, res,next) => {
  try {
    res.render("verification");
  } catch (error) {
    console.log(error.message);
  }
};

//==================================== LOAD SINGLE PRODUCT ===========================//

const loadSingle = async (req, res,next) => {
  try {
    const id = req.params.id;
    const productData = await Product.find({ _id: id });
    const categoryData = await Category.find({ is_delete: false });

    const session = req.session.user_id;
    if (!session) {
      return res.render("singleProduct", {
        session,
        product: productData,
        category: categoryData,
      });
    }
    const userData = await User.findById({ _id: req.session.user_id });
    if (userData) {
      return res.render("singleProduct", {
        user: userData,
        session,
        product: productData,
        category: categoryData,
      });
    } else {
      const session = null;
      return res.render("singleProduct", {
        session,
        product: productData,
        category: categoryData,
      });
    }
  } catch (error) {
     next(error)
  }
};

//================================= SENDING MAIL TO USER ===========================//

const sendverifyMail = async (name, email, otp) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.mail,
        pass: process.env.password,
      },
    });
    const mailOptions = {
      from: process.env.mail,
      to: email,
      subject: "verification Email",
      html: `<p>Hi ${name}, please click <a href="http://localhost:3004/otp">here</a> to verify and enter your verification email.This${otp}</p> `,
    };
    console.log(otp);
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error.message);
  }
};

//============================ VERIFY THE USER OTP AND REDIRECT TO LOGIN PAGE ========================//

const verifyEmail = async (req, res,next) => {
  const otp2 = req.body.otp;
  console.log(otp2 + email + otp);
  try {
    if (otp2 == otp) {
      const userData = await User.findOneAndUpdate(
        { email: email },
        { $set: { is_verified: true } }
      );
      if (userData) {
        res.redirect("/login");
      } else {
        res.render("verification", { message: "please check the otp again" });
      }
    } else {
      res.render("verification", { message: "please check the otp again" });
    }
  } catch (error) {
    next(error)
  }
};

//===================================  USER PROFILE LOAD ========================================//

const loadUserProfile = async (req, res,next) => {
  try {
    const session = req.session.user_id;
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });
    const userData = await User.findById({ _id: req.session.user_id });
    const address = addressDetails.addresses;

    res.render("userProfile", { session: session, address, user: userData });
  } catch (error) {
    next(error)
  }
};



//===================================== FOR RESET PASSWORD SEND EMAIL ===============================//

const sendResetPassword = async (name, email, otp3) => {
  try {
    otp_to_verify = otp3;
    console.log(otp_to_verify + "otp verify is");
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.mail,
        pass: process.env.password,
      },
    });

    const mailOptions = {
      from: process.env.mail,
      to: email,
      subject: "verification Email",
      html: `<p>Hi ${name}, please click <a href="http://localhost:3004/forgetPassword">here</a> to verify and enter your verification email.This${otp3}</p> `,
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error.message);
  }
};

//============================ LOAD FORGET PAGE =======================================//
const loadForget = async (req, res,next) => {
  try {
    res.render("forget");
  } catch (error) {
    next(error)
  }
};

// ============================== VERIFY USER AND SENTING THE RESET PASSWORD ==============================//

const forgetVerify = async (req, res,next) => {
  try {
    const email = req.body.email;
    emalreset = email;
    console.log("1" + emalreset);

    const userData = await User.findOne({ email: email });
    if (userData) {
      randomnumber = Math.floor(Math.random() * 9000) + 1000;
      otp3 = randomnumber;
      if (userData.is_verified == false) {
        res.render("forget", { message: "please Verify Your mail" });
      } else {
        randomnumber = Math.floor(Math.random() * 9000) + 1000;
        otp3 = randomnumber;
        sendResetPassword(userData.name, userData.email, otp3);
        res.render("forget", { message: "please check mail and enter OTP" });
      }
    } else {
      res.render("forget", { message: "email is incorrect" });
    }
  } catch (error) {
    next(error)
  }
};

//=================================== VERIFY FORGET PASSWORD OTP ==============================//

const verifyForgetOtp = async (req, res,next) => {
  try {
    const otp4 = req.body.otp4;
    console.log(otp4 + "this is otp from user entered");

    if (otp4 == otp_to_verify) {
      res.redirect("/loadchange");
    } else {
      res.render("forget", { message: "something went wrong" });
    }
  } catch (error) {
    next(error)
  }
};

//======================================= LOAD CHANGE PASSWORD =============================== //

const loadChangePassword = async (req, res,next) => {
  try {
    res.render("changePassword");
  } catch (error) {
    next(error)
  }
};

//==================================== CHANGE PASSWORD / PASSWORDING CHANGING (CHECKING)===================== //

const changePassword = async (req, res,next) => {
  try {
    console.log(emalreset);

    const password = req.body.password;
    const confPassword = req.body.confPassword;
    const passwordHash = await bcrypt.hash(password, 10);

    if (password == confPassword) {
      const user1 = await User.findOneAndUpdate(
        { email: emalreset },
        { $set: { password: passwordHash } }
      );
      res.redirect("/login");
    } else {
      res.render("changePassword", { message: "password is not matching" });
    }
  } catch (error) {
    next(error)
  }
};

///=========================== filter category====================== ///

const filterCategory = async (req,res,next)=>{
  try{
    var search = '';
    if(req.query.search){
      search = req.query.search;
    }
    const id = req.params.id;
    const limit = 6;
    const count = await Product.find({is_delete:false,
      $or:[
        {productName:{$regex:'.*'+search+'.*',$options:'i'}},
        {categoryName:{$regex:'.*'+search+'.*',$options:'i'}},
        // {description:{$regex:'.*'+search+'.*',$options:'i'}},
      ]
    })
    .countDocuments();
    const session = req.session.user_id;
    const categoryData = await Category.find({is_delete:false});
 
    const userData = await User.find({})
    
    const productData = await Product.find({categoryName:id,is_delete:false})
    console.log(productData+"ghjdffghsdrfgndfghdgfhj")
    if(categoryData.length > 0){
      res.render('shop',{totalPages:Math.ceil(count/limit),product:productData,session,category:categoryData,user:userData});
    }else{
      res.render('shop',{totalPages:Math.ceil(count/limit),product:[],session,category:categoryData,user:userData});
      
    }


  }catch(error){
    next(error)
  }
}


const priceSort=async(req,res,next)=>{
  try {
    console.log('shdgh');
    const id=req.params.id
    const session=req.session.user_id
    const userData=await User.findById(session)
    const categoryData=await Category.find({is_delete:false})
    const sortData= await Product.find({}).sort({price:id})
    if(sortData){
      res.render("shop",{product:sortData,category:categoryData,user:userData})
    }else{
      redirect('/shop')
    }
   
  } catch (error) {
    next(error)
  }
}



module.exports = {
  loadLogin,
  loadRegister,
  insertUser,
  verifyLogin,
  loadHome,
  userLogout,
  loadShop,
  loadSingle,
  verifyEmail,
  sendverifyMail,
  loadVerification,
  loadUserProfile,
  loadForget,
  forgetVerify,
  changePassword,

  verifyForgetOtp,
  loadChangePassword,
  // searchUser,
  filterCategory,
  priceSort
};
