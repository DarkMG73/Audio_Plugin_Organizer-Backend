const AdminDataSchema = require("../models/adminDataModel.js");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const download = require("image-downloader");
const path = require("path");
const adminList = require("../data/adminList.js");

const appCollectionName = "admin-data";

// const options = {
//   url:
//     "https://www.delamar.de/wp-content/uploads/2019/01/brainworx_spl_iron.jpg",
//   dest: "/", // will be saved to /path/to/dest/image.jpg
// };
// download
//   .image(options)
//   .then(({ filename }) => {
//     console.log("------> line:9%cfilename", filename);
//     console.log("Saved to", filename); // saved to /path/to/dest/image.jpg
//   })
//   .catch((err) => console.error(err));

module.exports.downloadPicsFromDbPhotoURL = (req, res) => {
  // console.log("IN");
  // download
  //   .image(options)
  //   .then(({ filename }) => {
  //     console.log("------> line:9%cfilename", filename);
  //     console.log("Saved to", filename); // saved to /path/to/dest/image.jpg
  //   })
  //   .catch((err) => console.error(err));
};

module.exports.getAdminNotes = asyncHandler(async (req, res) => {
  const AdminData = mongoose.model(appCollectionName, AdminDataSchema);

  const appData = await AdminData.find({});
  res.json(appData);
});

module.exports.updateAdminNotes = asyncHandler(async (req, res) => {
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

  console.log("update admin notes ---------", req.user);
  const notes = req.body.dataObj;
  console.log("notes", notes);
  const filter = { _id: req.user._id };
  const AdminData = mongoose.model(appCollectionName, AdminDataSchema);
  AdminData.findOneAndUpdate(
    {},
    {
      notes: notes,
    },
    { new: true }
  )
    .then((doc) => {
      console.log("doc", doc);
      res.status(200).json({ message: "It worked.", doc: doc });
      res.status(200);
    })
    .catch((err) => {
      console.log("err", err);
      res.status(404).json({
        message: "Error when trying to update the admin notes.",
        err: err,
      });
      res.status(404);
    });
});
