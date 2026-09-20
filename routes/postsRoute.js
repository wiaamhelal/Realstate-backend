const {
  createNewOrderCtrl,
  getAllOrdersCtrl,
} = require("../controllers/ordersController");
const {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getPostCountCtrl,
  deletePostCtrl,
  updatePostCtrl,
  updatePostImageCtrl,
  toggleLikeCtrl,
  toggleDislikeCtrl,
  updatePostImage2Ctrl,
  getAllMaxPostsCtrl,
  createAdPostCtrl,
  getAllProductsAdsCtrl,
  deleteProductAdCtrl,
  createAdFor24HoursCtrl,
  get24ProductsAdsCtrl,
  deleteProductAd24Ctrl,
} = require("../controllers/postsController");
const photoUpload = require("../middlewares/photoUpload");
const validateObjedtId = require("../middlewares/validateObjedtId");
const {
  verifyToken,
  verfyTokenAndAdmin,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

router.route("/get-product-ad").get(getAllProductsAdsCtrl);
router.route("/get-product-ad-24hours").get(get24ProductsAdsCtrl);
// /api/posts
router
  .route("/")
  .post(verifyToken, photoUpload.array("images", 9), createPostCtrl)
  .get(getAllPostsCtrl);

// /api/posts/max-posts
router.route("/max-posts").get(getAllMaxPostsCtrl);

// /api/posts/count
router.route("/count").get(getPostCountCtrl);

// /api/posts/:id
router
  .route("/:id")
  .get(validateObjedtId, getSinglePostCtrl)
  .delete(validateObjedtId, verifyToken, deletePostCtrl)
  .put(validateObjedtId, verifyToken, updatePostCtrl);

// /api/posts/update-image/:id
router
  .route("/update-image/:id")
  .put(
    validateObjedtId,
    verifyToken,
    photoUpload.single("image"),
    updatePostImageCtrl
  );

// /api/posts/update-image2/:id
router
  .route("/update-image2/:id")
  .put(
    validateObjedtId,
    verifyToken,
    photoUpload.single("image"),
    updatePostImage2Ctrl
  );

// /api/posts/like/:id
router.route("/like/:id").put(validateObjedtId, verifyToken, toggleLikeCtrl);

// /api/posts/dislike/:id
router
  .route("/dislike/:id")
  .put(validateObjedtId, verifyToken, toggleDislikeCtrl);

// /api/posts/create-product-ad
router
  .route("/create-product-ad")

  .post(verfyTokenAndAdmin, createAdPostCtrl);

// /api/posts/delete-ad
router
  .route("/delete-ad/:id")

  .delete(verfyTokenAndAdmin, deleteProductAdCtrl);

// /api/posts/create-product-ad
router
  .route("/ad-for-24hours")
  .post(verfyTokenAndAdmin, createAdFor24HoursCtrl);

// /api/posts/create-product-ad
router
  .route("/ad-for-24hours/:id")
  .delete(verfyTokenAndAdmin, deleteProductAd24Ctrl);

// /api/posts/delete-ad
// router
// .route("/delete-ad/:id")

// .delete(verfyTokenAndAdmin, deleteProductAdCtrl);

module.exports = router;
