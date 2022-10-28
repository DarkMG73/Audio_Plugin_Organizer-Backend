import connectDB from "./backend/config/db.js";
import userRoute from "./backend/routes/userRoute.js";
// import User from "./backend/models/userModel";
import adminRoute from "./backend/routes/adminRoute.js";
import audioPluginRoute from "./backend/routes/audioPluginRoute.js";
import bodyParser from "body-parser";
import jsonwebtoken from "jsonwebtoken";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// setup route middlewares
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(helmet());
console.log("Trip through ------->");
const options = {
  origin: true,
  credentials: true,
};
app.use(cors(options));

app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

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
        if (err) req.user = undefined;
        req.user = decode;

        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});

// app.use(function (req, res) {
//   res.status(404).send({ url: req.originalUrl + " not found" });
// });

//Creating API for user
app.use("/api/users", userRoute);

//Creating API for Audio Plugin Info
app.use("/api/all-plugins", audioPluginRoute);

//Creating API for admin functions
app.use("/api/special-admin/", adminRoute);

const PORT = process.env.PORT || 8000;

//Express js listen method to run project on http://localhost:8000
app.listen(
  PORT,
  console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
