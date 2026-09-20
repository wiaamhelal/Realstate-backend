const router = require("express").Router();
const { verfyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjedtId");
const {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  dlelteCategorieCtrl,
  createCategoryCtrl2,
  createadCtrl,
  getAlladsCtrl,
  deleteAdCtrl,
} = require("../controllers/categorysController");
const photoUpload = require("../middlewares/photoUpload");

// api/category
// إنشاء فئة جديدة
router.post(
  "/",
  verfyTokenAndAdmin,
  photoUpload.array("images", 2), // ← السماح برفع صورة أو صورتين
  createCategoryCtrl2
);

router.post(
  "/exist",
  verfyTokenAndAdmin,
  photoUpload.array("images", 1), // ← السماح برفع صورة أو صورتين
  createCategoryCtrl2
);

// 🔹 جلب جميع الفئات
router.get("/", getAllCategoriesCtrl);

//api/categories/:id
router
  .route("/:id")
  .delete(validateObjectId, verfyTokenAndAdmin, dlelteCategorieCtrl);

//api/categories/createad
router
  .route("/createad")
  .post(verfyTokenAndAdmin, createadCtrl)
  .get(getAlladsCtrl);

//api/categories/createad/:id
router.route("/createad/:id").delete(verfyTokenAndAdmin, deleteAdCtrl);
module.exports = router;
