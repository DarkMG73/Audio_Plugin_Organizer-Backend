import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

const appCookieName = "giProductionTool";

export const register = asyncHandler(async (req, res) => {
  console.log(" --> line:8 req", req.body);
  const user = { ...req.body, isAdmin: false };
  const newUser = new User(user);

  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  console.log(" --> newUser", newUser);
  newUser.save(function (err, user) {
    if (err) {
      console.log(" --> Resgister err", err);
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

export const sign_in = asyncHandler(async (req, res) => {
  console.log(" --> sign_in req.body", req.body);
  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      if (err) {
        console.log(" --> sign_in req.body", req.body);
        throw err;
      }
      console.log(" --> sign_in user", user);
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({
          message: "Authentication failed. Invalid user or password.",
        });
      }
      return res.json({
        token: jwt.sign(
          { email: user.email, fullName: user.fullName, _id: user._id },
          process.env.SECRET,
          { expiresIn: "1 day" } // The httponly cookie expres in 12 hours, so this would only apply if that cookie is tampered with.
        ),

        firstName: user.firstName,
        secondName: user.secondName,
        userName: user.userName,
        email: user.email,
        created: user.created,
        _id: user._id,
      });
    }
  );
});

export const setCookie = asyncHandler(async (req, res) => {
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

export const deleteCookie = asyncHandler(async (req, res) => {
  res.status(202).clearCookie(appCookieName).send("Cookie cleared");
});

export const getCookie = asyncHandler(async (req, res) => {
  if (req.cookies[appCookieName]) {
    res.status(202).send({ cookie: req.cookies[appCookieName] });
  } else {
    res.status(404).send(false);
  }
});

export const loginRequired = asyncHandler(async (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized user 1!!" });
  }
});

export const get_user_by_token = asyncHandler(async (req, res, next) => {
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
export const getUsers = asyncHandler(async (req, res) => {
  if (req.user) {
    const users = await User.find({});
    res.json(users);
  } else {
    res.status(401).json({ message: "Unauthorized user 3!!" });
  }
});

//getUserById function to retrieve user by id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  //if user id match param id send user else throw error
  if (user) {
    user.hash_password = undefined;
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
    res.status(404);
    throw new Error("User not found");
  }
});
