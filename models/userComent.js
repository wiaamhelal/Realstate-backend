const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userCommentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlenth: 100,
    },
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    imageURL: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
  },
  {
    timeseries: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

// populate comment for this post
// postSchema.virtual("users", {
//   ref: "User",
//   foreignField: "user._id",
//   localField: "userID",
// });

const validateCreateClientComment = (obj) => {
  const schema = Joi.object({
    text: Joi.string().trim().min(2).max(200).required(),
  });
  return schema.validate(obj);
};
const UserComment = mongoose.model("Usercomment", userCommentSchema);

module.exports = {
  UserComment,
  validateCreateClientComment,
};
