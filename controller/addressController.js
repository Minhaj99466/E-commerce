const User = require("../model/userModel");
const Address = require("../model/addressModel");

//===========LOAD ADDRESS=============//

const loadAddress = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });
    const userData = await User.findById({ _id: req.session.user_id });

    if (addressDetails) {
      const address = addressDetails.addresses;
      res.render("address", { session: session, address, user: userData });
    } else {
      res.render("address", { session: session, address: [], user: userData });
    }
  } catch (error) {
    next(error);
  }
};

//============LOAD ADD ADDRESS=========//

const loadaddAddress = async (req, res, next) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const session = req.session.user_id;
    if (req.session.user_id) {
      res.render("addAddress", { session, user: userData });
    } else {
      redirect("/");
    }
  } catch (error) {
    next(error);
  }
};

//============= ADDRESS INSERTING SECTION===========//

const insertAddress = async (req, res, next) => {
  try {
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });
    console.log(addressDetails);
    if (addressDetails) {
      const updateOne = await Address.updateOne(
        { userId: req.session.user_id },
        {
          $push: {
            addresses: {
              userName: req.body.userName,
              mobile: req.body.mobile,
              altrenativeMob: req.body.altrenativeMobile,
              houseName: req.body.house,
              landmark: req.body.landmark,
              city: req.body.city,
              state: req.body.state,
              pincode: req.body.pincode,
            },
          },
        }
      );

      if (updateOne) {
        res.redirect("/checkout");
      } else {
        res.redirect("/");
      }
    } else {
      const address = new Address({
        userId: req.session.user_id,
        addresses: [
          {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.altrenativeMobile,
            houseName: req.body.house,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        ],
      });
      console.log(address);
      const addressData = await address.save();
      if (addressData) {
        res.redirect("/checkout");
      } else {
        res.redirect("/checkout");
      }
    }
  } catch (error) {
    next(error);
  }
};

//============= DELETE ADDRESS ============ //

const deleteAddress = async (req, res, next) => {
  try {
    const id = req.body.id;

    await Address.updateOne(
      { userId: req.session.user_id },
      { $pull: { addresses: { _id: id } } }
    );
    res.json({ remove: true });
  } catch (error) {
    next(error);
  }
};

//=============== LOAD EDIT ADDRESS ============= //

const loadEditAddress = async (req, res, next) => {
  try {
    const id = req.query.id;
    const session = req.session.user_id;
    const user = await User.find({});
    const addressData = await Address.findOne(
      { userId: session },
      { addresses: { $elemMatch: { _id: id } } }
    );
    const address = addressData.addresses;
    res.render("editAddress", {
      address: address[0],
      session: session,
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

//================ UPDATE ADDRESS ============  //

const updateAddress = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    const id = req.query.id;
    console.log(id);
    const address = await Address.updateOne(
      { userId: session },
      { $pull: { addresses: { _id: id } } }
    );
    console.log(address);
    const pushAddress = await Address.updateOne(
      { userId: session },
      {
        $push: {
          addresses: {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.altrenativeMobile,
            houseName: req.body.house,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        },
      }
    );
    res.redirect("/checkout");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadAddress,
  loadaddAddress,
  insertAddress,
  deleteAddress,
  loadEditAddress,
  updateAddress,
};
