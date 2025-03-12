const {
  downloadPicsFromDbPhotoURL,
  getAdminNotes,
  updateAdminNotes,
} = require("../controllers/adminController.js");
const express = require("express");
const router = express.Router();

// express router method to create route for downloading plugin pics
router.route("/").get(downloadPicsFromDbPhotoURL);

// express router method to create route for getting admin notes
router.route("/notes/").get(getAdminNotes);

// express router method to create route for updating admin notes
router.route("/notes/").post(updateAdminNotes);
module.exports = router;
