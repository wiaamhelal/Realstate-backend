const asyncHander = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/users");
const { Post } = require("../models/posts");
const { Comment } = require("../models/comments");
const bcrypt = require("bcryptjs");
const path = require("path");
const {
  cloudinaryUploadImage,
  cloudinaryReoveImage,
  cloudinaryReoveMultipleImage,
} = require("../utils/cloudinary");
const fs = require("fs");
const sendEmail = require("../utils/sendEmail");
const Stripe = require("stripe");

//-----------------------------
// desc get all users profile
// route /api/users/profile
// method GET
// access only the admin
//-----------------------------

module.exports.getAllUsersCtrl = asyncHander(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

//-----------------------------
// desc get user profile
// route /api/users/profile/:id
// method GET
// access public
//-----------------------------

module.exports.getUserProfileCtrl = asyncHander(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (!user) {
    res.status(404).json({ message: "user not found" });
  }
  res.status(200).json(user);
});

//-----------------------------
// desc update user profile
// route /api/users/profile/:id
// method POT
// private (only user himself)
//-----------------------------

module.exports.upadateUserProfileCtrl = asyncHander(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
        credit: req.body.credit,
      },
    },
    { new: true }
  )
    .select("-password")
    .populate("posts");
  res.status(200).json(updateUser);
});

//-----------------------------
// desc get users cout
// route /api/users/count
// method GET
// access only the admin
//-----------------------------

module.exports.getUsersCountCtrl = asyncHander(async (req, res) => {
  const usersCount = await User.countDocuments();
  res.status(200).json(usersCount);
});

//-----------------------------
// desc upload user photo
// route /api/users/profile/profile-photo-upload
// method POST
// access only logged in user
//-----------------------------

module.exports.profilePhotoUploadCtrl = asyncHander(async (req, res) => {
  // validation
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }
  // 2-get the image path
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  // 3-upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);

  // 4-get the user from DB
  const user = await User.findById(req.user.id);

  // 5-delete the old photo if exist
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryReoveImage(user.profilePhoto.publicId);
  }

  // 6-change the profile photo field form DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  // 7-send response to the client
  res.status(200).json({
    message: "you have been uploaded your photo successfuly",
    profilePhoto: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // 8- remove the image form the server
  fs.unlinkSync(imagePath);
});

//-----------------------------
// delete user profile
// route /api/users/profile/:id
// method delete
// private (only the admin or the user him self)
//-----------------------------
module.exports.deleteUserPfofileCtrl = asyncHander(async (req, res) => {
  // 1-get user from DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user is not exist" });
  }
  // 2- got all posts from db
  const posts = await Post.find({ user: user._id });

  // 3- get the public id from the posts
  const publicIds = posts?.map((post) => post.image.publicId);

  // 4- delete all posts image from cloudinary that belong to this user
  if (publicIds?.length > 0) {
    await cloudinaryReoveMultipleImage(publicIds);
  }

  // 5-delete the profile pic from cloudinary
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryReoveImage(user.profilePhoto.publicId);
  }

  // 6-delete user posts and comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  // 7-delete the user himself
  await User.findByIdAndDelete(req.params.id);

  // 8-send response to the client
  res.status(200).json({ message: "the user has been deleted" });
});

// module.exports.addUserCommentCtrl = asyncHander(async(req,res) => {
//   const user = req.user;

// })

module.exports.createLocationUserCtrl = asyncHander(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        location: {
          phone: req.body.phone,
          country: req.body.country,
          city: req.body.city,
          arya: req.body.arya,
          street: req.body.street,
          building: req.body.building,
        },
      },
    },
    { new: true }
  );
  res.status(200).json(updatedUser);
});

module.exports.getLocationUserCtrl = asyncHander(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        location: {
          phone: req.body.phone,
          arya: req.body.arya,
          street: req.body.street,
          building: req.body.building,
        },
      },
    },
    { new: true }
  );
  res.status(200).json(updatedUser);
});

module.exports.createUserOrdersCtrl = asyncHander(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  // let updatedUser = await User.findByIdAndUpdate(
  //   req.params.id,
  //   {
  //     $set: {
  //       orders: [],
  //     },
  //   },
  //   { new: true }
  // );
  // res.status(200).json(updatedUser);

  let updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        orders: req.body.orders,
      },
    },
    { new: true }
  );
  res.status(200).json(updatedUser);
});

module.exports.sendingConfirmToTheClient = asyncHander(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  // creating HTML template
  const link = "https://wiaam-store.web.app/orders";

  const htmlTemplate = `
      <div>
      <h2>thank you ${user.username} for your order</h2>
      <p> we will follow up with you on the details<p>
      <a href="${link}" style="text-align:center;font-weight:bold;margin:auto;display:flex;justify-content:center;width:fit-content;" >Order Details</a>
     </div>
      

      `;

  // sending email
  await sendEmail(user.email, "your order has been received", htmlTemplate);
});

module.exports.createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe يعمل بالسنت
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//-----------------------------
// desc toggle like
// route /api/user-like/:id
// method put
// access only the logged in user
//-----------------------------
module.exports.toggleLikeUserCtrl = asyncHander(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  const isPostAlreadyLiked = user.likes.find(
    (userId) => userId.toString() === req.user.id
  );
  if (isPostAlreadyLiked) {
    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          likes: req.user.id,
        },
      },
      { new: true }
    );
  } else {
    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          likes: req.user.id,
        },
      },
      { new: true }
    );
  }

  res.status(200).json(user);
});

//-----------------------------
// desc toggle dislike
// route /api/posts/:id
// method put
// access only the logged in user
//-----------------------------
module.exports.toggleDislikeUserCtrl = asyncHander(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  const isPostAlreadyLiked = user.dislikes.find(
    (userId) => userId.toString() === req.user.id
  );
  if (isPostAlreadyLiked) {
    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          dislikes: req.user.id,
        },
      },
      { new: true }
    );
  } else {
    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          dislikes: req.user.id,
        },
      },
      { new: true }
    );
  }

  res.status(200).json(user);
});

module.exports.createRateUserCtrl = asyncHander(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  user = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      rate: req.body.rate,
    },
  });
});

module.exports.changeUserAuthCtrl = asyncHander(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        isAdmin: req.body.isAdmin,
      },
    },
    { new: true }
  );
  res.status(200).json(updatedUser);
});
