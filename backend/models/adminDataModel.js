const mongoose = require("mongoose");

const adminDataSchema = mongoose.Schema(
  {
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = adminDataSchema;
