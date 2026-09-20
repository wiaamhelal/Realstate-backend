const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Ad24HoursSchema = new mongoose.Schema(
  {
    order: {
      type: Object,
    },
    user: {
      type: Object,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // expires: 20,
      expires: 60 * 60 * 24, // 24 ساعة = 86400 ثانية
    },
  }
  // {
  //   timeseries: true,
  //   timestamps: true,
  // }
);

// (async () => {
//   await mongoose.connect(
//     "mongodb+srv://wiaambusiness28:3aWtJeOh3kxhmyJu@cluster0.zqolu1d.mongodb.net/blog?retryWrites=true&w=majority"
//   ); // أو connection string الخاص بك
//   await AdFor24Hours.syncIndexes();
//   console.log("✅ TTL index synced successfully");
// })();

Ad24HoursSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

const validateCreateAd24Hours = (obj) => {
  const schema = Joi.object({
    order: Joi.object().required(),
    user: Joi.object().required(),
  });
  return schema.validate(obj);
};
const validateUpdateAd24Hours = (obj) => {
  const schema = Joi.object({
    text: Joi.string().trim().min(2).max(200).required(),
  });
  return schema.validate(obj);
};
const AdFor24Hours = mongoose.model("AdFor24Hours", Ad24HoursSchema);

module.exports = {
  AdFor24Hours,
  validateCreateAd24Hours,
  validateUpdateAd24Hours,
};
