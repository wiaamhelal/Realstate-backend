const asyncHander = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sedEmail = require("../utils/sendEmail");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/users");
const VerivacationToken = require("../models/verifacation");
const { link } = require("joi");

module.exports.registerUserCtrl = asyncHander(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "the user is already exist" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashePassword = await bcrypt.hash(req.body.password, salt);

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashePassword,
  });
  await user.save();
  // creating new verificationToken and save it in DB
  const verivacationToken = new VerivacationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await verivacationToken.save();

  // making the link
  const link = `https://wiaam-store.web.app/users/${user._id}/verify/${verivacationToken.token}`;

  // puting the link into html tmeplete
  const htmlTemplate = `
<div>
  <p>click on the link below to verify your email</p>
  <a href="${link}">verify</a>
</div>
`;
  // sending email to the user
  await sedEmail(user.email, "verify your email", htmlTemplate);

  // responce to the client
  res.status(201).json({
    message: "we send to you an email please vefify your email address",
  });
});

// login user
// login user

module.exports.loginUserCtrl = asyncHander(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // if user exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email" });
  }
  //if passwrd corect
  const ispasswordMatch = bcrypt.compare(req.body.password, user.password);
  if (!ispasswordMatch) {
    return res.status(400).json({ message: "invalid password" });
  }

  if (!user.isAccountVerified) {
    res.status(400).json({
      message:
        "we send to you an email please verify your email address than you can login",
    });
    //     let verificationToken = await VerivacationToken.findOne({
    //       userId: user._id,
    //     });
    //     if (!verificationToken) {
    //       verificationToken = new VerivacationToken({
    //         userId: user._id,
    //         token: crypto.randomBytes(32).toString("hex"),
    //       });
    //       await verificationToken.save();
    //     }

    //     // making the link
    //     const link = `http://localhost:3000/users/${user._id}/verify/${verivacationToken.token}`;

    //     // puting the link into html tmeplete
    //     const htmlTemplate = `
    // <div>
    //   <p>click on the link below to verify your email</p>
    //   <a href="${link}">verify</a>
    // </div>
    // `;
    //     // sending email to the user
    //     await sedEmail(user.email, "verify your email", htmlTemplate);
    //       res.status(400).json({
    //         message: "we send to you an email please vefify your email address",
    //       })
  }
  const token = user.generateAuthToken();
  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
    email: user.email,
    isAccountVerified: user.isAccountVerified,
  });
});

// the route is : /api/auth/:userId/verify/:token
module.exports.verifyUserAcountCtrl = asyncHander(async (req, res) => {
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
  user.isAccountVerified = true;

  await user.save();

  await verificationToken.deleteOne();

  res.status(200).json({ message: "your account verified" });
});
