const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

const appCookieName = "giProductionTool";

module.exports.register = asyncHandler(async (req, res) => {
  const user = { ...req.body, isAdmin: false };
  const newUser = new User(user);

  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function (err, user) {
    if (err) {
      console.log(" --> Resister err", err);
      return res.status(400).send({
        message: err,
      });
    } else {
      console.log(" --> SUCCESS user", user);
      user.hash_password = undefined;
      return res.json(user);
    }
  });
});

module.exports.sign_in = asyncHandler(async (req, res) => {
  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      if (err) {
        console.log(" --> sign_in req.body", req.body);
        return res.status(401).json({
          message: "There was a problem with authentication: " + err,
        });
      }
      console.log(" --> sign_in user", user);
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({
          message: "Authentication failed. Invalid user or password.",
        });
      }
      try {
        if (user.isAdmin) {
          if (process.env.SECRET && process.env.SECRET != "undefined") {
            return res.json({
              token: jwt.sign(
                { email: user.email, fullName: user.fullName, _id: user._id },
                process.env.SECRET,
                { expiresIn: "1 day" } // The httpOnly cookie express in 12 hours, so this would only apply if that cookie is tampered with.
              ),

              firstName: user.firstName,
              secondName: user.secondName,
              userName: user.userName,
              email: user.email,
              created: user.created,
              _id: user._id,
              isAdmin: user.isAdmin,
            });
          } else {
            console.log(
              "There is a temporary server issue. Please try your request again. Error: NS-UC-1"
            );
            return res.status(403).json({
              message:
                "There is a temporary issue accessing the required security data. Please try your request again. Error: NS-UC-1",
            });
          }
        } else {
          if (process.env.SECRET && process.env.SECRET != "undefined") {
            return res.json({
              token: jwt.sign(
                { email: user.email, fullName: user.fullName, _id: user._id },
                process.env.SECRET,
                { expiresIn: "1 day" } // The httpOnly cookie expires in 12 hours, so this would only apply if that cookie is tampered with.
              ),

              firstName: user.firstName,
              secondName: user.secondName,
              userName: user.userName,
              email: user.email,
              created: user.created,
              _id: user._id,
            });
          } else {
            console.log(
              "There is a temporary server issue. Please try your request again. Error: NS-UC 2"
            );
            return res.status(403).json({
              message:
                "There is a temporary issue accessing the required security data. Please try your request again. Error: NS-UC-2",
            });
          }
        }
      } catch {
        console.log(
          "There is a temporary server issue. Please try your request again. Error: NS"
        );
        return res.status(500).json({
          message:
            "There is a temporary issue running part of the program on the server. Please try your request again and contact the website admin if teh problem persists. Error: TC-UC",
        });
      }
    }
  );
});

module.exports.setCookie = asyncHandler(async (req, res) => {
  res
    .status(202)
    .cookie(appCookieName, req.body.user.token, {
      sameSite: "strict",
      // domain: process.env.DOMAIN,  // Will not work on dev work via localhost
      path: "/",
      expires: new Date(new Date().getTime() + 43200 * 1000), // 12 hours
      httpOnly: true,
      // uncomment when moving to production
      secure: true,
    })
    .send("Cookie being initialized");
});

module.exports.deleteCookie = asyncHandler(async (req, res) => {
  res.status(202).clearCookie(appCookieName).send("Cookie cleared");
});

module.exports.getCookie = asyncHandler(async (req, res) => {
  if (req.cookies[appCookieName]) {
    res.status(202).send({ cookie: req.cookies[appCookieName] });
  } else {
    res.status(404).send(false);
  }
});

module.exports.loginRequired = asyncHandler(async (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized user 1!!" });
  }
});

module.exports.get_user_by_token = asyncHandler(async (req, res, next) => {
  if (req.user && req.user._id) {
    const user = await User.findById(req.user._id);
    user.hash_password = undefined;
    res.status(200).json(user);
    next();
  } else {
    res.status(401).json({ message: "Unauthorized user 2!!" });
  }
});

//getUsers function to get all users
module.exports.getUsers = asyncHandler(async (req, res) => {
  if (req.user) {
    const users = await User.find({});
    res.json(users);
  } else {
    res.status(401).json({ message: "Unauthorized user 3!!" });
  }
});

//getUserById function to retrieve user by id
module.exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  //if user id match param id send user else send error
  if (user) {
    user.hash_password = undefined;
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
    res.status(404);
  }
});
