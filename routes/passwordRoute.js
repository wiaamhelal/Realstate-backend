const router = require("express").Router();

const {
  getResetPasswordLinkCtrl,
  sendResetPasswordCtrl,
  resetPasswordCtrl,
} = require("../controllers/passwordController");

// /api/password/reset-password-link
router.post("/reset-password-link", sendResetPasswordCtrl);

// /api/password/reset-password/:userId/:token
router
  .route("/reset-password/:userId/:token")
  .get(getResetPasswordLinkCtrl)
  .post(resetPasswordCtrl);

module.exports = router;
