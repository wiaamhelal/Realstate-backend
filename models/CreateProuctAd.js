const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const productAdSchema = new mongoose.Schema(
  {
    order: {
      type: Object,
    },
    user: {
      type: Object,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const validateCreateProductAd = (obj) => {
  const schema = Joi.object({
    order: Joi.object().required(),
    user: Joi.object().required(),
  });
  return schema.validate(obj);
};
const validateUpdateOrder = (obj) => {
  const schema = Joi.object({
    text: Joi.string().trim().min(2).max(200).required(),
  });
  return schema.validate(obj);
};
const ProductAd = mongoose.model("ProductAd", productAdSchema);

module.exports = {
  ProductAd,
  validateCreateProductAd,
  validateUpdateOrder,
};
