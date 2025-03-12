const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const path = require("path");
const appCookieName = "giProductionTool";
const { sendEmail } = require("../tools/sendEmail");
const {
  usePasswordValidator,
  passwordRequirements,
} = require("../tools/usePasswordValidator");

const userProps = (user) => {
  return {
    firstName: user.firstName,
    secondName: user.secondName,
    userName: user.userName,
    email: user.email,
    created: user.created,
    pluginPaths: user.pluginPaths,
    ignoredPlugins: user.ignoredPlugins,
    missingIgnoredPlugins: user.missingIgnoredPlugins,
    _id: user._id,
  };
};

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
        console.log(
          "%c⚪️►►►► %cline:65%cuser",
          "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
          "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
          "color:#fff;background:rgb(89, 61, 67);padding:3px;border-radius:2px",
          user
        );
        if (user.isAdmin) {
          if (process.env.SECRET && process.env.SECRET != "undefined") {
            const outputObj = {
              token: jwt.sign(
                { email: user.email, fullName: user.fullName, _id: user._id },
                process.env.SECRET,
                { expiresIn: "1d" } // The httpOnly cookie express in 24 hours, so this would only apply if that cookie is tampered with.
              ),
              isAdmin: user.isAdmin,
              // ._doc required for getting at the document only when passing the Mongoose response.
              ...userProps(user._doc),
            };

            console.log(
              "%c⚪️►►►► %cline:95%coutputObj",
              "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
              "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
              "color:#fff;background:rgb(38, 157, 128);padding:3px;border-radius:2px",
              outputObj
            );
            return res.json(outputObj);
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
                { expiresIn: "1d" } // The httpOnly cookie expires in 12 hours, so this would only apply if that cookie is tampered with.
              ),

              // ._doc required for getting at the document only when passing the Mongoose response.
              ...userProps(user._doc),
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
    console.log(
      "%c⚪️►►►► %cline:166%cuser",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(38, 157, 128);padding:3px;border-radius:2px",
      user
    );
    console.log(
      "%c⚪️►►►► %cline:193%cuser.isAdmin",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(20, 68, 106);padding:3px;border-radius:2px",
      user.isAdmin
    );
    if (user.isAdmin) {
      console.log(
        "%c⚪️►►►► %cline:166%cuser",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(38, 157, 128);padding:3px;border-radius:2px",
        user
      );
      console.log(
        "%c⚪️►►►► %cline:171%c..userProps(user)",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(39, 72, 98);padding:3px;border-radius:2px",
        {
          // ._doc required for getting at the document only when passing the Mongoose response.
          ...userProps(user._doc),
        }
      );
      if (process.env.SECRET && process.env.SECRET != "undefined") {
        const outputObj = {
          token: req.user._id,
          isAdmin: user.isAdmin,
          // ._doc required for getting at the document only when passing the Mongoose response.
          ...userProps(user._doc),
        };
        console.log(
          "%c⚪️►►►► %cline:230%coutputObj",
          "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
          "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
          "color:#fff;background:rgb(114, 83, 52);padding:3px;border-radius:2px",
          outputObj
        );
        res.status(200).json(outputObj);
      } else {
        console.log(
          "There is a temporary server issue. Please try your request again. Error: NS-UC-1"
        );
        res.status(403).json({
          message:
            "There is a temporary issue accessing the required security data. Please try your request again. Error: NS-UC-1",
        });
      }
    } else {
      if (process.env.SECRET && process.env.SECRET != "undefined") {
        res.status(200).json({
          token: req.user._id,

          // ._doc required for getting at the document only when passing the Mongoose response.
          ...userProps(user._doc),
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

    // res.status(200).json(user);
    // next();
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

///////////////////////////////////
// Update User Plugin Paths
///////////////////////////////////
module.exports.updateUserPluginPaths = asyncHandler(async (req, res) => {
  console.log("updateUserPluginPaths ---------", req.user);
  const userPluginPaths = req.body.dataObj;
  console.log("userPluginPaths", userPluginPaths);
  const filter = { _id: req.user._id };
  const user = await User.findOne(filter);
  console.log("user", user);

  if (user._id.toString() === req.user._id) {
    User.findOneAndUpdate(
      filter,
      {
        pluginPaths: userPluginPaths,
      },
      { new: false }
    )
      .then((doc) => {
        console.log("doc", doc.email);
        res.status(200).json({ message: "It worked.", doc: doc });
        res.status(200);
      })
      .catch((err) => {
        console.log("err", err);
        res.status(404).json({
          message: "Error when trying to save the user history.",
          err: err,
        });
        res.status(404);
      });
  } else {
    res.status(404).json({ message: "User not found" });
    res.status(404);
  }
});

///////////////////////////////////
// Update Ignored Plugins
///////////////////////////////////
module.exports.updateIgnoredPlugins = asyncHandler(async (req, res) => {
  console.log("updateIgnoredPlugins ---------", req.user);
  const ignoredPlugins = req.body.dataArray;
  console.log("ignoredPlugins", ignoredPlugins);
  const filter = { _id: req.user._id };
  const user = await User.findOne(filter);
  console.log("user", user);

  if (user._id.toString() === req.user._id) {
    User.findOneAndUpdate(
      filter,
      {
        ignoredPlugins: ignoredPlugins,
      },
      { new: false }
    )
      .then((doc) => {
        console.log("doc", doc.email);
        res.status(200).json({ message: "It worked.", doc: doc });
        res.status(200);
      })
      .catch((err) => {
        console.log("err", err);
        res.status(404).json({
          message: "Error when trying to save the user history.",
          err: err,
        });
        res.status(404);
      });
  } else {
    res.status(404).json({ message: "User not found" });
    res.status(404);
  }
});

///////////////////////////////////
// Update Missing Ignored Plugins
///////////////////////////////////
module.exports.updateMissingIgnoredPlugins = asyncHandler(async (req, res) => {
  console.log("updateIgnoredPlugins ---------", req.user);
  const ignoredPlugins = req.body.dataArray;
  console.log("ignoredPlugins", ignoredPlugins);
  const filter = { _id: req.user._id };
  const user = await User.findOne(filter);
  console.log("user", user);

  if (user._id.toString() === req.user._id) {
    User.findOneAndUpdate(
      filter,
      {
        missingIgnoredPlugins: ignoredPlugins,
      },
      { new: false }
    )
      .then((doc) => {
        console.log("doc", doc.email);
        res.status(200).json({ message: "It worked.", doc: doc });
        res.status(200);
      })
      .catch((err) => {
        console.log("err", err);
        res.status(404).json({
          message: "Error when trying to update the user history.",
          err: err,
        });
        res.status(404);
      });
  } else {
    res.status(404).json({ message: "User not found" });
    res.status(404);
  }
});

////////////////////////////////////
// Update User History - Local Use
///////////////////////////////////
const updateUserHistoryLocalFunction = async (dataObj, requestedUser) => {
  let output = {};
  console.log("Updating User History Local");
  console.log("dataObj", dataObj);
  const filter = { _id: requestedUser._id };
  const user = await User.findOne(filter);
  console.log("user", user);

  if (user._id.toString() === requestedUser._id.toString()) {
    output = await User.findOneAndUpdate(filter, dataObj, { new: true });
    if (output) {
      console.log("Success: ", output);
      output = { status: 200, data: { message: "Success!", doc: output } };
    } else {
      console.log("err", output);
      output = {
        status: 404,
        data: {
          message: "Error when trying to save the user history.",
          err: err,
        },
      };
    }
  } else {
    callback({ status: 404, data: { message: "User not found" } });
    output = { status: 404, data: { message: "User not found" } };
  }
  return output;
};

////////////////////////////////
/// Send Forgotten Password HTML
////////////////////////////////
exports.render_forgot_password_template = function (req, res) {
  const thePath = path.resolve("./public/forgot-password.html");

  return res
    .set(
      "Content-Security-Policy",
      "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
    )
    .set("X-Frame-Options", "")
    .sendFile(path.resolve("./public/forgot-password.html"));
};

////////////////////////////////
/// Send Reset Password HTML
////////////////////////////////
exports.render_reset_password_template = function (req, res) {
  return res
    .set(
      "Content-Security-Policy",
      "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
    )
    .sendFile(path.resolve("./public/reset-password.html"));
};

////////////////////////////////
/// Forgot Password POST Route
////////////////////////////////
exports.forgot_password = function (req, res) {
  console.log(" --> forgot_password req.body", req.body);

  User.findOne(
    {
      email: req.body.email,
    },
    function (err, user) {
      console.log(" --> Found User", user);
      if (err) {
        console.log(" --> 1 forgot_password Find User Error", err);
        return res.status(401).json({
          message: "There was a problem with authentication: " + err,
        });
      }
      if (!user) {
        console.log(
          " --> 2 forgot_password There was a problem with authentication: User " +
            req.body.email +
            " was not found."
        );
        return res.status(401).json({
          message:
            "There was a problem with authentication: User " +
            req.body.email +
            ' was not found. Please fix the email address or, if you are not signed up yet, use the "Sign Up" button to get started.',
        });
      }
      console.log(" --> Confirming and Sending Email");

      try {
        if (process.env.SECRET && process.env.SECRET != "undefined") {
          const JWTToken = jwt.sign(
            {
              email: user.email,
              fullName: user.fullName,
              _id: user._id,
              passwordReset: true,
            },
            process.env.SECRET,

            { expiresIn: "1d" } // The httpOnly cookie expires in 10 minutes, so this would only apply if that cookie is tampered with.
          );

          let domain = process.env.DOMAIN;
          console.log(
            "%c⚪️►►►► %cline:298%cdomain",
            "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
            "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
            "color:#fff;background:rgb(178, 190, 126);padding:3px;border-radius:2px",
            domain
          );
          console.log("process.env.NODE_ENV --->", process.env.NODE_ENV);
          if (process.env.NODE_ENV === "development")
            domain = "http://localhost:8000/";
          const mailOptions = {
            from: process.env.MAILER_EMAIL_ID,
            to: user.email,
            template: "forgot-password-email",
            subject: "Audio Plugin Tool Reset Request",
            text: "That was easy!",
            context: {
              url: domain + "api/users/auth/reset_password?token=" + JWTToken,
              name: "Mike",
            },
          };

          sendEmail(mailOptions)
            .then((emailResponse) => {
              console.log("res", emailResponse);
              return res.status(250).json({
                message: "The email was sent!",
              });
            })
            .catch((err) => {
              console.log("Send email error: ", err);
              return res.status(403).json({
                message:
                  "There is an issue trying to send the email. Please try your request again. Error: EM-UC-1",
              });
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
      } catch (err) {
        console.log(
          "There is a temporary server issue. Please try your request again. Error: NS | ",
          err
        );
        return res.status(500).json({
          message:
            "There is a temporary issue running part of the program on the server. Please try your request again and contact the website admin if the problem persists. Error: TC-UC | " +
            err,
        });
      }
    }
  );
};

/////////////////////////////////////////
/// Reset password POST Route
/////////////////////////////////////////
exports.reset_password = async (req, res, next) => {
  const { newPassword, verifyPassword, token } = req.body;
  const passwordValidator = usePasswordValidator();

  const passwordValidCheck = passwordValidator(newPassword, true);

  if (!passwordValidCheck.isValid) {
    if (process.env.NODE_ENV === "development")
      console.log("--> passwordTestResults", passwordValidCheck);
    res.status(412).json({
      valid: false,
      message: `The password does not meet the requirements. It failed with these errors:\n\n${passwordValidCheck.details
        .map((error, i) => {
          const groomedMessage = error.message
            .replace("string", "password")
            .replace("digit", "number");
          return "   " + (i + 1) + ": " + groomedMessage + ". ";
        })
        .join(
          "\n"
        )}\n\nHere are all of the password requirements: ${passwordRequirements}`,
    });
  } else {
    if (newPassword === verifyPassword) {
      let tokenData = null;
      try {
        tokenData = jwt.verify(token, process.env.SECRET);
      } catch (err) {
        if (process.env.SECRET && process.env.SECRET != "undefined") {
          console.log(
            "<><><> There is a temporary server issue. Please try your request again. Error: NS-UC1",
            err
          );
          res.status(403).json({
            message:
              "There is a temporary issue accessing the required security data. Please try your request again. Error: NS-UC2 | " +
              err,
          });
        } else {
          console.log(
            "<><><> There is an issue with the JWT. Error: JWT-UC1",
            err
          );
          res.status(401).json({
            message:
              "There is a temporary issue accessing the required security data. Please try your request again. Error: JWT-UC1 | " +
              err,
          });
        }
      }

      if (tokenData.passwordReset) {
        const groomedNewPasswordData = {
          hash_password: bcrypt.hashSync(newPassword, 10),
        };

        const filter = { email: tokenData.email };
        const user = await User.findOne(filter);
        console.log("<><><> FOUND USER ->", user);

        const updateResults = await updateUserHistoryLocalFunction(
          groomedNewPasswordData,
          user
        );

        console.log("<><><> updateResults: ", updateResults);

        if (updateResults.status < 400) {
          console.log(
            "<><><> updateResults.status < 400",
            updateResults.status < 400
          );

          if (
            groomedNewPasswordData.hash_password ===
            updateResults.data.doc.hash_password
          ) {
            res.status(200).json({
              message: updateResults.data.message,
              data: updateResults.data,
            });
          } else {
            updateResults.data.message = "error";
            res.status(403).json({
              message:
                "A problem occurred and the password was not able to be reset. Please contact teh site administrator for further assistance.",
              data: updateResults.data,
            });
          }
        }
        if (updateResults.status >= 400) {
          console.log("err", updateResults);
          res.status(404).json({
            message: "Error when trying to save the user history.",
            err: updateResults.data.message,
          });
        }
      } else {
        res.json({
          message:
            "Password reset is not allowed in this case. If you need to reset your password, please contact this site administrator.",
        });
      }
      next();
    } else {
      console.log("Passwords do not match", newPassword, verifyPassword);
      res.status(412).json({
        message:
          "The two passwords do not match. please ensure they are identical.",
      });
      next();
    }
  }

  next();
};
