const asyncHander = require("express-async-handler");
const { validateEmail, User, validateNewPassord } = require("../models/users");
const VerivacationToken = require("../models/verifacation");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
//-----------------------------
// desc send reset password link
// route /api/password/reset-password-link
// method POST
// access only the admin
//-----------------------------

module.exports.sendResetPasswordCtrl = asyncHander(async (req, res) => {
  // 1- validation
  const { error } = validateEmail(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2- get the user form database by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).json({ message: "the email dosnt exist" });
  }

  // 3- creating varivicationToken
  let verivicationToken = await VerivacationToken.findOne({ userId: user._id });
  if (!verivicationToken) {
    verivicationToken = new VerivacationToken({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    await verivicationToken.save();
  }
  // creating link
  const link = `https://wiaam-store.web.app/reset-password/${user._id}/${verivicationToken.token}`;

  // creating HTML template
  const htmlTemplate = `<a href="${link}">click here to reset your password</a>`;

  // sending email
  await sendEmail(user.email, "reset your password", htmlTemplate);

  // send response to the client
  res.status(200).json({
    message: "password reset link is send to your email, please check on it",
  });
});

//-----------------------------
// desc get reset password link
// route /api/password/reset-password/:userId/:token
// method get
// access only the admin
//-----------------------------

module.exports.getResetPasswordLinkCtrl = asyncHander(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }
  const verificationToken = await VerivacationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }

  res.status(200).json({ message: "valik url" });
});

//-----------------------------
// desc get reset password link
// route /api/password/reset-password/:userId/:token
// method post
// access only the admin
//-----------------------------

module.exports.resetPasswordCtrl = asyncHander(async (req, res) => {
  // 1- validation
  const { error } = validateNewPassord(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(400).json({ message: "the user dosnt exist" });
  }

  const verificationToken = await VerivacationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    res.status(400).json({ message: "invalid link" });
  }
  if (!user.isAccountVerified) {
    user.isAccountVerified = true;
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  user.password = hashPassword;
  await user.save();
  await verificationToken.deleteOne();

  res.status(200).json({ message: "password reset successfuly please login" });
});
