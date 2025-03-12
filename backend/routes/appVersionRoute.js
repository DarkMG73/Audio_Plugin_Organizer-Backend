const {
  GetAppVersions,
  UpdateAppVersions,
} = require("../controllers/appVersionController.js");
const { loginRequired } = require("../controllers/userController.js");

const express = require("express");

const router = express.Router();

// express router method to create route for getting all users
router.route("/get").get(GetAppVersions);

// express router method to create route for getting all users
router.route("/update").post(loginRequired, UpdateAppVersions);

module.exports = router;
