const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const createadSchima = new mongoose.Schema(
  {
    category: {
      type: String,
    },
    range: {
      type: Number,
    },
    url: {
      type: String,
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

const valedateCreateAd = (obj) => {
  const schema = Joi.object({
    category: Joi.string().required(),
    url: Joi.string().required(),
    range: Joi.number().required(),
  });
  return schema.validate(obj);
};
const Createad = mongoose.model("createad", createadSchima);

module.exports = {
  Createad,
  valedateCreateAd,
};
