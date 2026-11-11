const express = require("express");
const { uploadPropertyImages } = require("../middlewares/uploadMiddleware");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyControler");
const {
  cloudinaryUploadMiddleware,
} = require("../middlewares/cloudinaryUploadMiddleware");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.route("/").get(getProperties);
router.route("/:id").get(getProperty);

// Protected routes
// router.route("/").post(protect, createProperty);
// router.route("/").post(protect, uploadPropertyImages, createProperty);
router
  .route("/")
  .post(
    protect,
    uploadPropertyImages,
    cloudinaryUploadMiddleware,
    createProperty
  );
router
  .route("/:id")
  .patch(protect, updateProperty)
  .delete(protect, deleteProperty);

module.exports = router;
