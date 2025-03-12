const appVersionSchema = require("../models/appVersionModel.js");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const adminList = require("../data/adminList.js");

const appCollectionName = "app-version";
module.exports.GetAppVersions = asyncHandler(async (req, res) => {
  const AppVersion = mongoose.model(appCollectionName, appVersionSchema);

  console.log("AppVersion", AppVersion);
  const appVersion = await AppVersion.find({});
  res.json(appVersion);
});

/// UPDATE APP VERSIONS /////////////////////////////
module.exports.UpdateAppVersions = asyncHandler(async (req, res) => {
  let userIsAllowed = false;
  if (
    req &&
    Object.hasOwn(req, "user") &&
    req.user &&
    Object.hasOwn(req.user, "_id") &&
    adminList["app-version"].includes(req.user._id)
  )
    userIsAllowed = true;

  if (!userIsAllowed)
    res
      .status(403)
      .json({ message: "Sorry; you do not have permission to access this." });

  const dataObj = req.body.dataObj;
  console.log(
    "%c⚪️►►►► %cline:32%cdataObj",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(161, 23, 21);padding:3px;border-radius:2px",
    dataObj
  );
  const AppVersion = mongoose.model(appCollectionName, appVersionSchema);

  AppVersion.findOneAndUpdate({}, { $set: dataObj }, { new: true })
    .then((doc) => {
      res.status(200).json({ message: "It worked.", doc: doc });
      res.status(200);
    })
    .catch((err) => {
      console.log("err", err);
      res.status(404).json({
        message: "Error when trying to save the plugin.",
        err: err,
      });
      res.status(404);
    });
});
