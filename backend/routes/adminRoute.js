const downloadPicsFromDbPhotoURL = require("../controllers/adminController.js")
  .downloadPicsFromDbPhotoURL;
const express = require("express");
const router = express.Router();

// express router method to create route for getting all users
router.route("/").get(downloadPicsFromDbPhotoURL);

module.exports = router;
