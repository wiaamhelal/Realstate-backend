const mongoose = require("mongoose");

// category schema
const verivacationSchima = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// verivacation model
const VerivacationToken = mongoose.model("verivacation", verivacationSchima);

module.exports = VerivacationToken;
