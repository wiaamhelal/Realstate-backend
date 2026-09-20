const mongoose = require("mongoose");
const joi = require("joi");

// post schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    productDetails: {
      type: String,
    },
    price: {
      type: Number,
    },
    oldPrice: {
      type: Array,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    mainCategory: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
    },
    colors: {
      type: Array,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    sales: {
      type: Number,
    },
    premium: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populate comment for this post
postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

// post model
const Post = mongoose.model("Post", postSchema);

// validate create post
const validateCreatePost = (obj) => {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200).required(),
    description: joi.string().trim().min(10).required(),
    productDetails: joi.string().trim().min(10).required(),
    category: joi.string().trim().required(),
    price: joi.number(),
    oldPrice: joi.array(),
    mainCategory: joi.string().trim().required(),
    colors: joi.array(),
    sales: joi.number(),
    premium: joi.boolean(),
  });
  return schema.validate(obj);
};

// validate update post
const validateUpdatePost = (obj) => {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200),
    description: joi.string().trim().min(10),
    category: joi.string().trim(),
    price: joi.number(),
    oldPrice: joi.array(),
    sales: joi.number(),
    premium: joi.boolean(),
  });
  return schema.validate(obj);
};

module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost,
};
