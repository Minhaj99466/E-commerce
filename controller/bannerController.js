const User = require("../model/userModel");
const Banner = require("../model/bannerModel");

//======================== LOAD BANNER MANAGEMENT ===============

const loadBannerManagement = async (req, res, next) => {
  try {
    const adminData = await User.find({ is_admin: 1 });
    const banners = await Banner.find();
    res.render("bannerList", { admin: adminData, banners });
  } catch (error) {
    next(error);
  }
};
//================ ADD BANNER ====================

const addBanner = async (req, res, next) => {
  try {
    const heading = req.body.heading;
    let image = "";
    if (req.file) {
      image = req.file.filename;
    }
    const banner = new Banner({
      heading: heading,
      image: image,
    });
    banner.save();
    res.redirect("/admin/banner");
  } catch (error) {
    next(error);
  }
};

//================ EDIT BANNER ====================

const editBanner = async (req, res, next) => {
  try {
    const id = req.body.id;
    const heading = req.body.heading;
    let image = req.body.img;

    if (req.file) {
      image = req.file.filename;
    }
    await Banner.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          heading: heading,
          image: image,
        },
      }
    );
    res.redirect("/admin/banner");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadBannerManagement,
  addBanner,
  editBanner,
};
