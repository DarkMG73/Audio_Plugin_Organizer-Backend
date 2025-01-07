const {
  getUsers,
  getUserById,
  register,
  sign_in,
  setCookie,
  deleteCookie,
  getCookie,
  loginRequired,
  get_user_by_token,
  render_forgot_password_template,
  render_reset_password_template,
  forgot_password,
  reset_password,
  updateIgnoredPlugins,
  updateMissingIgnoredPlugins,
  updateUserPluginPaths,
} = require("../controllers/userController.js");
const express = require("express");

const router = express.Router();

// express router method to create route for getting all users
router.route("/auth/register").post(register);

// express router method to create route for getting all users
router.route("/auth/sign_in").post(sign_in);

// express router method to create route for sending password reset email
router
  .route("/auth/forgot_password")
  .get(render_forgot_password_template)
  .post(forgot_password);

// express router method to create route for handling password reset email
router
  .route("/auth/reset_password")
  .get(render_reset_password_template)
  .post(reset_password);

// express router method to set the logged-in user httponly cookie in the client
router.route("/auth/setCookie").post(setCookie);

// express router method to remove the logged-in user httponly cookie from the client
router.route("/auth/deleteCookie").get(deleteCookie);

// express router method to get the logged-in user httponly cookie from the client
router.route("/auth/getCookie").get(getCookie);

// express router method to create route for getting all users
router.route("/auth/get_user_by_token").get(loginRequired, get_user_by_token);

// express router method to update the local locations of plugins
router.route("/auth/update-plugin-paths").post(updateUserPluginPaths);

// express router method to create route for updating ignored plugins
router.route("/auth/update-ignored-plugins").post(updateIgnoredPlugins);

// express router method to create route for updating missing ignored plugins
router
  .route("/auth/update-missing-ignored-plugins")
  .post(updateMissingIgnoredPlugins);

// express router method to create route for getting users by id
router.route("/:id").get(getUserById);

// express router method to create route for getting all users
router.route("/").get(getUsers);

module.exports = router;
