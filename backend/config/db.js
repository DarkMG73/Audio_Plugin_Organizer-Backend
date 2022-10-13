import mongoose from "mongoose";
import User from "../models/userModel.js";
import AudioPlugin from "../models/pluginModel.js";

const connectDB = async () => {
  try {
    //database Name
    const databaseName = "audio_plugins";
    const con = await mongoose.connect(
      `mongodb+srv://DarkMG73:M%237thsus4th@cluster0.wqwws.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`Database connected : ${con.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
