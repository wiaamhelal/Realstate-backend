const {
  getAllUsersCtrl,
  getUserProfileCtrl,
  getUsersCount,
  profilePhotoUploadCtrl,
  deleteUserPfofileCtrl,
  getUsersCountCtrl,
  createLocationUserCtrl,
  createUserOrdersCtrl,
  sendingConfirmToTheClient,
  toggleLikeUserCtrl,
  toggleDislikeUserCtrl,
  createRateUserCtrl,
  changeUserAuthCtrl,
  createPaymentIntent,
} = require("../controllers/usersController");
const {
  verfyTokenAndAdmin,
  verfyTokenAndUser,
  verifyToken,
  verfyTokenAndAuthoriation,
} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjedtId");
const { upadateUserProfileCtrl } = require("../controllers/usersController");
const photoUpload = require("../middlewares/photoUpload");

const router = require("express").Router();

// /api/users/profile/
router.route("/profile").get(getAllUsersCtrl);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectId, getUserProfileCtrl)
  .put(validateObjectId, verfyTokenAndUser, upadateUserProfileCtrl)
  .delete(validateObjectId, verfyTokenAndAuthoriation, deleteUserPfofileCtrl);

// /api/users/count
router.route("/count").get(verfyTokenAndAdmin, getUsersCountCtrl);

// /api/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl);

// /api/users/location/:id
router
  .route("/location/:id")
  .put(verifyToken, verfyTokenAndAuthoriation, createLocationUserCtrl);

// /api/users/orders/:id
router
  .route("/orders/:id")
  .put(verifyToken, verfyTokenAndAuthoriation, createUserOrdersCtrl);

// /api/users/confirm-order/
router.route("/confirm-order/:id").get(sendingConfirmToTheClient);

// /api/users/create-payment-intent
router.post("/create-payment-intent", createPaymentIntent);

// /api/users/user-like/:id
router
  .route("/user-like/:id")
  .put(validateObjectId, verifyToken, toggleLikeUserCtrl);

// /api/users/user-dislike/:id
router
  .route("/user-dislike/:id")
  .put(validateObjectId, verifyToken, toggleDislikeUserCtrl);

router.route("user-rate/:id").put(createRateUserCtrl);

// /api/users/user-auth/:id
router
  .route("/user-auth/:id")
  .put(validateObjectId, verfyTokenAndAdmin, changeUserAuthCtrl);
module.exports = router;
