const mongoose = require("mongoose");
const joi = require("joi");

// category schema
const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mainTitle: {
      type: String,
      required: true,
      trim: true,
    },
    branchTitle: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: Array,
      // default: {
      //   url: "",
      //   publicId: null,
      // },
    },
  },
  {
    timestamps: true,
  }
);

// category model
const Category = mongoose.model("Category", categorySchema);

// validate create category
function validateCreateCategory(obj) {
  const schema = joi.object({
    mainTitle: joi.string().trim().required(),
    branchTitle: joi.string().trim().required(),
    // images: joi.array(),
  });
  return schema.validate(obj);
}

module.exports = {
  validateCreateCategory,
  Category,
};
