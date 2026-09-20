const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userOrdersSchema = new mongoose.Schema(
  {
    orderDetails: {
      type: Object,
      required: true,
    },
    userDetails: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userInfo: {
      type: Object,
      require: true,
    },

    orderStatus: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: String,
    },
    payment: {
      type: String,
      required: true,
    },
    closeBy: {
      type: String,
    },
    closeTime: {
      type: Number,
    },
    CancelReason: {
      type: String,
    },
    canceledBy: {
      type: String,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const validateCreateOrder = (obj) => {
  const schema = Joi.object({
    text: Joi.string().trim().min(2).max(200).required(),
    totalPrice: Joi.number().required(),
  });
  return schema.validate(obj);
};

const validateUpdateOrder = (obj) => {
  const schema = Joi.object({
    payment: Joi.string().trim().min(2).max(200).required(),
  });
  return schema.validate(obj);
};

// const validateUpdateOrder = (obj) => {
//   const schema = Joi.object({
//     // text: Joi.string().trim().min(2).max(200).required(),
//     payment: Joi.string().trim().min(2).max(200).required,
//   });
//   return schema.validate(obj);
// };
const UserOrder = mongoose.model("Userorder", userOrdersSchema);

module.exports = {
  UserOrder,
  validateCreateOrder,
  validateUpdateOrder,
};
