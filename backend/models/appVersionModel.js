const mongoose = require("mongoose");

const appVersionSchema = mongoose.Schema(
  {
    desktopVersion: {
      type: String,
      required: true,
    },
    desktopVersionReleaseDate: {
      type: String,
    },
    desktopVersionMsg: {
      type: String,
    },
    desktopVersionDownloadLink: {
      type: String,
    },
    webVersion: {
      type: String,
      required: true,
    },
    webVersionReleaseDate: {
      type: String,
    },
    webVersionMsg: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = appVersionSchema;
