const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlenth: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlenth: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    location: {
      type: Object,
    },
    orders: {
      type: Array,
    },
    credit: {
      type: Array,
    },
    orderDate: {
      type: Number,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png",
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    // isAdmin: {
    //   type: Boolean,
    //   default: true,
    // },
    role: {
      type: String,
      enum: ["buyer", "agent", "admin"],
      default: "buyer",
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    dislikes: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    rate: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// show posts that belongs to this user when he get his profile
userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

//generate auth token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET
  );
};

const User = mongoose.model("User", userSchema);
// validate register user
const validateRegisterUser = (obj) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required(),
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
};

// validate login user
const validateLoginUser = (obj) => {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required(),
    password: Joi.string().trim().min(8).max(100).required(),
  });
  return schema.validate(obj);
};

// validate update user
const validateUpdateUser = (obj) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100),
    password: passwordComplexity(),
    bio: Joi.string(),
    credit: Joi.array(),
  });
  return schema.validate(obj);
};

// validate login user
const validateEmail = (obj) => {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
  });
  return schema.validate(obj);
};

// validate login user
const validateNewPassord = (obj) => {
  const schema = Joi.object({
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
};

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
  validateEmail,
  validateNewPassord,
};
