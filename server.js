import dotenv from "dotenv";
import connectDB from "./backend/config/db.js";
import userRoute from "./backend/routes/userRoute.js";
// import User from "./backend/models/userModel";
import adminRoute from "./backend/routes/adminRoute.js";
import audioPluginRoute from "./backend/routes/audioPluginRoute.js";
import bodyParser from "body-parser";
import jsonwebtoken from "jsonwebtoken";
import express from "express";

import cookieParser from "cookie-parser";

/// SECURITY ///
import helmet from "helmet";
import rateLimit from "express-rate-limit";

//connect database
connectDB();

//dotenv config
dotenv.config();

// create express app
const app = express();

// setup route middleware

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 10 minutes)
  message:
    "Too many accounts created from this IP, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(helmet());
console.log("Trip through ------->");

const whitelist = [
  "http://localhost:3000",
  "https://audio-plugin-organizer.glassinteractive.com/",
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
  exposedHeaders: ["sessionId"],
  credentials: true,
};
// app.use(cors(options));

app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cookieParser());

try {
  app.use(function (req, res, next) {
    console.log("A request------->");
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "JWT"
    ) {
      jsonwebtoken.verify(
        req.headers.authorization.split(" ")[1],
        process.env.SECRET,
        function (err, decode) {
          if (err) {
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
  app.use("/api/users", userRoute);

  //Creating API for Audio Plugin Info
  app.use("/api/all-plugins", audioPluginRoute);

  //Creating API for admin functions
  app.use("/api/special-admin/", adminRoute);
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
