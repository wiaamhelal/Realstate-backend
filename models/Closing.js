const mongoose = require("mongoose");

const closingSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  totalCash: {
    type: Number,
    default: 0,
  },
  totalVisa: {
    type: Number,
    default: 0,
  },
  totalCredit: {
    type: Number,
    default: 0,
  },
  products: {
    type: Array,
  },
  //   [
  //     {
  //       name: String,
  //       price: Number,
  //       paymentType: {
  //         type: String,
  //         enum: ["cash", "visa", "credit"],
  //       },
  //       quantity: Number,
  //     },
  //   ],
});

module.exports = mongoose.model("Closing", closingSchema);
