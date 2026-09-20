const {
  registerUserCtrl,
  loginUserCtrl,
  verifyUserAcountCtrl,
} = require("../controllers/authControler");

const router = require("express").Router();
// /api/auth/register
router.post("/register", registerUserCtrl);

// /api/auth/login
router.post("/login", loginUserCtrl);

// /api/auth/:userId/verify/:token
router.get("/:userId/verify/:token", verifyUserAcountCtrl);

module.exports = router;
