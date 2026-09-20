const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const returnOrderSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
    },
    user: {
      type: Object,
    },
    order: {
      type: Object,
    },
    images: {
      type: Array,
    },
    orderAprovedBy: {
      type: String,
    },
    rejectReason: {
      type: String,
    },
    returnStatus: {
      type: String,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

// const validateReturnOrder = (obj) => {
//   const schema = Joi.object({
//     reason: Joi.string().required(),
//     images: Joi.array().required(),
//     order: Joi.required(),
//   });
//   return schema.validate(obj);
// };
const ReturnOrder = mongoose.model("ReturnOrder", returnOrderSchema);

module.exports = {
  ReturnOrder,
  // validateReturnOrder,
};
