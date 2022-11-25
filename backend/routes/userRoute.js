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
} = require("../controllers/userController.js");
const express = require("express");

const router = express.Router();

// express router method to create route for getting all users
router.route("/auth/register").post(register);

// express router method to create route for getting all users
router.route("/auth/sign_in").post(sign_in);

// express router method to set the logged-in user httponly cookie in the client
router.route("/auth/setCookie").post(setCookie);

// express router method to remove the logged-in user httponly cookie from the client
router.route("/auth/deleteCookie").get(deleteCookie);

// express router method to get the logged-in user httponly cookie from the client
router.route("/auth/getCookie").get(getCookie);

// express router method to create route for getting all users
router.route("/auth/get_user_by_token").get(loginRequired, get_user_by_token);

// express router method to create route for getting users by id
router.route("/:id").get(getUserById);

// express router method to create route for getting all users
router.route("/").get(getUsers);

module.exports = router;
