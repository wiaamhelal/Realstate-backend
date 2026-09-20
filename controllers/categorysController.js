const asyncHandler = require("express-async-handler");
const { Category, validateCreateCategory } = require("../models/category");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryReoveImage,
  cloudinaryUploadImages,
  cloudinaryReoveMultipleImage,
} = require("../utils/cloudinary");
const { Createad, valedateCreateAd } = require("../models/Createad");

//-----------------------------
// desc greate a new category
// route /api/category
// method POST
// access only the admin
//-----------------------------

// module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
//   const { error } = validateCreateCategory(req.body);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }
//   const category = await Category.create({
//     title: req.body.title,
//     user: req.user.id,
//   });
//   res.status(201).json(category);
// });

module.exports.createCategoryCtrl2 = asyncHandler(async (req, res) => {
  // 1- التحقق من وجود الصور
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images provided" });
  }

  // 2- التحقق من صحة البيانات
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 3- رفع الصور إلى Cloudinary
  // const uploadPromises = req.files.map(async (file) => {
  //   try {
  //     const imagePath = path.join(__dirname, `../images/${file.filename}`);
  //     const result = await cloudinaryUploadImage(imagePath);
  //     fs.unlink(imagePath, (err) => {
  //       if (err) console.error("Error deleting file:", err);
  //     });
  //     return result;
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     throw new Error("Failed to upload image");
  //   }
  // });

  const uploadPromises = (req.files || []).map(async (file) => {
    try {
      const imagePath = path.join(__dirname, `../images/${file.filename}`);
      const result = await cloudinaryUploadImage(imagePath);

      // حذف الملف من السيرفر بعد رفعه
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  });

  let uploadResults;
  //   try {
  //   } catch (error) {
  //     retur    uploadResults = await Promise.all(uploadPromises);
  // n res.status(500).json({ message: "Image upload failed" });
  //   }

  try {
    uploadResults = await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Cloudinary Upload Error:", error); // طباعة الخطأ الحقيقي
    return res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
  // 4- إنشاء المنشور وحفظه في قاعدة البيانات
  const images = uploadResults.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
  }));

  let category;
  try {
    category = await Category.create({
      mainTitle: req.body.mainTitle,
      branchTitle: req.body.branchTitle,
      user: req.user.id,
      images,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Failed to create post" });
  }

  // 5- الرد النهائي
  res.status(201).json({
    message: "category created successfully",
    category,
  });
});

//-----------------------------
// desc greate all categories
// route /api/category
// method GET
// access pulic
//-----------------------------

module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

//-----------------------------
// desc delete categorie
// route /api/category/:id
// method DELETE
// access only admin
//-----------------------------

module.exports.dlelteCategorieCtrl = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }
  const publicIds = category.images?.map((cate) => cate.publicId);
  await cloudinaryReoveMultipleImage(publicIds);
  await Category.findByIdAndDelete(req.params.id);
  res
    .status(200)
    .json({ message: "category has been deleted", categoryId: category._id });
});

// create ad
module.exports.createadCtrl = asyncHandler(async (req, res) => {
  // 2-validate the data
  const { error } = valedateCreateAd(req.body);
  if (error) res.status(400).json({ message: error.details[0].message });

  // const user = await User;
  // const user = await User.findById(req.user.id);

  // 4-create a new client comment and save it in DB
  const createad = await Createad.create({
    category: req.body.category,
    range: req.body.range,
    url: req.body.url,
    user: req.user,
  });

  // 5- send response to the client
  res.status(201).json(createad);
});

// create ad
module.exports.getAlladsCtrl = asyncHandler(async (req, res) => {
  const allAds = await Createad.find();
  res.status(200).json(allAds);
});

module.exports.deleteAdCtrl = asyncHandler(async (req, res) => {
  const ads = await Createad.findById(req.params.id);
  if (!ads) {
    return res.status(404).json({ message: "ad not found" });
  }
  await Createad.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "ad has been deleted", adId: ads._id });
});
