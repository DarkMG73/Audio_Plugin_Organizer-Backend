const dotenv = require("dotenv");
const connectDB = require("./backend/config/db.js");
const userRoute = require("./backend/routes/userRoute.js");
// import User = require(".)/backend/models/userModel";
const adminRoute = require("./backend/routes/adminRoute.js");
const audioPluginRoute = require("./backend/routes/audioPluginRoute.js");
const appVersionRoute = require("./backend/routes/appVersionRoute.js");
const bodyParser = require("body-parser");
const jsonwebtoken = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

/// SECURITY ///
helmet = require("helmet");
rateLimit = require("express-rate-limit");

//connect database
connectDB();

//dotenv config
dotenv.config();

// create express app
const app = express();

// setup route middleware

const globallimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1500, // Limit each IP to 200 requests per `window` (here, per 10 minutes)
  message:
    "Too many accounts created from this IP, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to all requests
app.use(globallimiter);

// Set user route limits
const userLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 50 requests per `window` (here, per 10 minutes)
  message:
    "Too many user requests from this IP, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Set user route limits
const pluginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
  message:
    "Too many user requests from this IP, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(helmet());
// console.log("Begin ------->");

const whitelist = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8000",
  "https://audio-plugin-organizer.glassinteractive.com/",
  "https://audio-plugin-organizer.glassinteractive.com",
  "https://www.audio-plugin-organizer.glassinteractive.com",
  "https://www.audio-plugin-organizer.glassinteractive.com/",
  "glassinteractive.com",
  "https://api-organizer.glassinteractive.com/",
  "http://localhost:1212/",
  "http://localhost:1212",
  "http://192.168.0.109:3000",
  "http://192.168.0.109:3000/",
  "http://192.168.1.119:3000",
];

const options = {
  // origin: true,
  origin: function (origin, callback) {
    console.log("origin", origin);
    console.log("whitelist", whitelist);
    console.log("whitelist.indexOf(origin)", whitelist.indexOf(origin));
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  exposedHeaders: "ratelimit-limit, ratelimit-remaining, ratelimit-reset",
  credentials: true,
  methods: ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
};
app.use(cors(options));

app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cookieParser());

try {
  app.use(function (req, res, next) {
    // ****************************************************************
    // *** FOR DEV ONLY REMOVE FOR PROD ***
    // ****************************************************************
    console.log("process.env.SECRET ", process.env.SECRET);
    console.log("process.env.PORT ", process.env.PORT);
    console.log("process.env.DOMAIN ", process.env.DOMAIN);
    // ****************************************************************
    console.log("A request------->");
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "JWT"
    ) {
      console.log(
        "%c⚪️►►►► %cline:116%creq.headers.authorization.split( )[1]",
        "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
        "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
        "color:#fff;background:rgb(1, 77, 103);padding:3px;border-radius:2px",
        req.headers
      );
      jsonwebtoken.verify(
        req.headers.authorization.split(" ")[1],
        process.env.SECRET,
        function (err, decode) {
          if (err) {
            console.log("An error of some sort -->", err);
            if (process.env.SECRET && process.env.SECRET != "undefined") {
              console.log(
                "There is a temporary server issue. Please try your request again. Error: NS-SVR",
                err
              );
              return res.status(403).json({
                message:
                  "There is a temporary issue accessing the required security data. Please try your request again. Error: NS-SVR | " +
                  err,
              });
            }
            req.user = undefined;
          }

          req.user = decode;

          next();
        }
      );
    } else {
      req.user = undefined;
      next();
    }
  });
} catch (err) {
  console.log(
    "There is a temporary server issue. Please try your request again. Error: TC-SRV",
    err
  );
}

// app.use(function (req, res) {
//   res.status(404).send({ url: req.originalUrl + " not found" });
// });

try {
  //Creating API for user
  app.use("/api/users", userLimiter, userRoute);

  //Creating API for Audio Plugin Info
  app.use("/api/all-plugins", pluginLimiter, audioPluginRoute);

  //Creating API for APP VERSIONS
  app.use("/api/app-versions", pluginLimiter, appVersionRoute);

  //Creating API for admin functions
  app.use("/api/special-admin/", userLimiter, adminRoute);
} catch (err) {
  console.log("There was an error when accessing the route: ", err);
}

const PORT = process.env.PORT || 31234;
//Express js listen method to run project on http://localhost:8000
try {
  app.listen(
    PORT,
    console.log(
      `App is running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  );
} catch (err) {
  console.log("There was an error on the server: ", err);
}
