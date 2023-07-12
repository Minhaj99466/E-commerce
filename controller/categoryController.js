const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const upperCase = require("upper-case");
let message = "";

//======================= LOAD CATEGORY ==========================//

const loadCategory = async (req, res, next) => {
  try {
    const adminData = await User.findById({ _id: req.session.auser_id });

    const category = await Category.find({ is_delete: false });

    res.render("category", {
      category: category,
      admin: adminData,
      message: message,
    });
    message = "";
  } catch (error) {
    next(error);
  }
};

//======================= ADD CATEGORY =================================//

const addCategory = async (req, res, next) => {
  try {
    const name = upperCase.upperCase(req.body.name);
    if (name.trim().length == 0) {
      message = "category already exists";
      res.redirect("/admin/category");
      return;
    }
    const existingCategory = await Category.findOne({ categoryName: name });
    const reUpdate = await Category.updateOne(
      { categoryName: name },
      { $set: { is_delete: false } }
    );
    if (existingCategory) {
      message = "category already exists";
      res.redirect("/admin/category");
      return;
    }
    const category = new Category({
      categoryName: name,
    });
    const categoryData = await category.save();

    if (categoryData) {
      message = "category is added";
      res.redirect("/admin/category");
    } else {
      message = "something went wrong";
      res.redirect("/admin/category");
    }
  } catch (error) {
    next(error);
    message = "something went wrong";
  }
};

//====================== LOAD ADD CATEGORY ==============================//

const loadEditCategory = async (req, res, next) => {
  try {
    const id = req.query.id;
    const category = await Category.findById({ _id: id });
    const adminData = await User.findById({ _id: req.session.auser_id });

    res.render("editCategory", { category: category, admin: adminData });
  } catch (error) {
    next(error);
  }
};

//=============================== EDIT CATEGORY ============================//

const editCategory = async (req, res, next) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    const adminData = await User.findById({ _id: req.session.auser_id });
    if (categoryData) {
      res.render("editCategory");
    }
  } catch (error) {
    next(error);
  }
};

//======================== UPDATE CATEGORY =========================//

const updateCategory = async (req, res, next) => {
  try {
    const id = req.body.id;
    const name = upperCase.upperCase(req.body.categoryName.trim());
    const existingCategory = await Category.findOne({
      categoryName: name,
      _id: { $ne: id },
    });
    if (existingCategory) {
      message = "category already exists";
      res.redirect("/admin/category");
      return;
    }
    const categorydata = await Category.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { categoryName: name } }
    );

    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};

//========================= DELETE CATEGORY ============================//

const deleteCategory = async (req, res, next) => {
  try {
    const categoryData = await Category.updateOne(
      { _id: req.query.id },
      { $set: { is_delete: true } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadCategory,
  addCategory,
  loadEditCategory,
  editCategory,
  updateCategory,
  deleteCategory,
};
