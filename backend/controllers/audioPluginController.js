const audioPluginSchema = require("../models/pluginModel.js");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const adminList = require("../data/adminList.js");
const fs = require("fs");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "do0dxcsdm",
  api_key: "571465655518481",
  api_secret: "iRVu-xBhZ-qe_zf6wwE8bF_cxd4", // Click 'View API Keys' above to copy your API secret
});

//Find Subfolders - DEV ONLY
// cloudinary.v2.api
//   .sub_folders("App-Audio_Plugin_Organizer/")
//   .then((res) => console.log("res3 ===>", res))
//   .catch((err) => console.log("ERR ===>", err));

function getAudioPluginModelAndCollection(user) {
  let collection = user ? user._id : "all-plugins";
  if (user && adminList["all-plugins"].includes(user._id)) {
    collection = "all-plugins";
  }
  return mongoose.model(collection, audioPluginSchema);
}

// TODO: FOR DEV TESTING ONLY *** getAudioPlugins function to get all plugins
module.exports.getAllLocalAudioPlugins = asyncHandler(async (req, res) => {
  const pluginPathsObj = req.query;
  const pluginPathsArray = Object.values(pluginPathsObj);
  console.log("pluginPathsArray ", pluginPathsArray);

  const allFileNamesSet = new Set();
  for (const directoryPath of Object.values(pluginPathsObj)) {
    if (!directoryPath) continue;
    console.log("directoryPath", directoryPath);

    try {
      const files = await fs.promises.readdir(directoryPath);
      files.map((name) => allFileNamesSet.add(name));
    } catch (err) {
      console.error("Error reading directory:", err);
      return;
    }
  }

  console.log("allFileNamesSet", allFileNamesSet);
  res.json(Array.from(allFileNamesSet));
});

// _________________________________

// getAudioPlugins function to get all plugins
module.exports.getAudioPlugins = asyncHandler(async (req, res) => {
  console.log("%c⚪️►►►► cloudinary", cloudinary);
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);
  console.log("AudioPlugin===>", AudioPlugin);
  const audioPlugins = await AudioPlugin.find({});

  // Get data on all OEM images
  const imagesOEMData = await cloudinary.v2.search
    .expression("asset_folder: App-Audio_Plugin_Organizer/images-oem")
    .sort_by("public_id", "desc")
    .max_results(300)
    .execute();

  res.json({ audioPlugins, imagesOEMData: imagesOEMData?.resources });
});

// getAudioPluginBy_Id function to retrieve user by id
module.exports.getAudioPluginBy_Id = asyncHandler(async (req, res) => {
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);
  const audioPlugin = await AudioPlugin.findById(req.params.id);

  // if user id match param id send user else send error
  if (audioPlugin) {
    res.json(audioPlugin);
  } else {
    res.status(404).json({ message: "Plugin not found" });
    res.status(404);
  }
});

// getAudioPluginByHashId function to retrieve user
// by the Hash id assigned when it was created.
module.exports.getAudioPluginByHashId = asyncHandler(async (req, res) => {
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);
  const hashId = req.params.hashId;
  const filter = { id: hashId };
  const audioPlugin = await AudioPlugin.findOne(filter);

  //if user id match param id send user else send error
  if (audioPlugin) {
    res.json(audioPlugin);
  } else {
    res.status(404).json({ message: "Plugin not found" });
    res.status(404);
  }
});

/// ADD A PLUGIN ////////////////////////////
module.exports.AddAudioPlugin = asyncHandler(async (req, res, next) => {
  const audioPlugin = req.body.theData;
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);

  if (req.user) {
    const newAudioPlugin = new AudioPlugin(audioPlugin);
    newAudioPlugin
      .save()
      .then((doc) => {
        res.json(doc);
        return;
      })
      .catch((err) => {
        console.log("err", err);
        res
          .status(404)
          .json({ message: "Error when trying to save the plugin.", err: err });
        res.status(404);
        return new Error("Error saving plugin.");
      });
  } else {
    return res.status(401).json({ message: "Unauthorized user 1!!" });
  }
});

/// ADD MANY PLUGINS /////////////////////////////
module.exports.AddManyAudioPlugins = asyncHandler(async (req, res, next) => {
  const audioPlugin = req.body.theData;
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);

  if (req.user) {
    const newAudioPlugin = new AudioPlugin(audioPlugin);
    newAudioPlugin.collection
      .insertMany(audioPlugin, {
        ordered: false,
      })
      .then((doc) => {
        res.json(doc);
        return;
      })
      .catch((err) => {
        console.log("err", err);
        res
          .status(404)
          .json({ message: "Error when trying to save the plugin.", err: err });
        res.status(404);
      });
  } else {
    return res.status(401).json({ message: "Unauthorized user 1!!" });
  }
});

/// UPDATE A PLUGIN /////////////////////////////
module.exports.UpdateAudioPlugin = asyncHandler(async (req, res) => {
  const dataObj = req.body.dataObj;
  console.log(
    "%c⚪️►►►► %cline:157%cdataObj",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(60, 79, 57);padding:3px;border-radius:2px",
    dataObj
  );
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);

  // Convert strings to numbers where needed
  function groomObjectForDB(dataObj) {
    const requiresNumber = ["rating"];
    const requiresBoolean = ["oversampling", "favorite"];
    const newDataObj = {};

    const stringToBoolean = (string) => {
      switch (string.toLowerCase().trim()) {
        case "true":
        case "yes":
        case "1":
          return true;

        case "false":
        case "no":
        case "0":
        case null:
          return false;

        default:
          return Boolean(string);
      }
    };

    for (const key in dataObj) {
      if (requiresNumber.includes(key) && isNaN(dataObj[key])) {
        const newNumber = dataObj[key];
        newDataObj[key] = parseFloat(dataObj[key].replace('"', ""));
      } else if (
        requiresBoolean.includes(key) &&
        dataObj[key].constructor === String
      ) {
        newDataObj[key] = stringToBoolean(dataObj[key]);
      } else {
        newDataObj[key] = dataObj[key];
      }
    }

    return newDataObj;
  }

  const groomedDataObject = groomObjectForDB(dataObj);
  const dbID = groomedDataObject.dbID;
  const filter = { _id: dbID };
  const audioPlugin = await AudioPlugin.findOne(filter);

  if (audioPlugin._id.toString() === dbID) {
    AudioPlugin.findOneAndUpdate(
      filter,
      { $set: groomedDataObject },
      { new: false }
    )
      .then((doc) => {
        res.status(200).json({ message: "It worked.", doc: doc });
        res.status(200);
      })
      .catch((err) => {
        console.log("err", err);
        res.status(404).json({
          message: "Error when trying to save the plugin.",
          err: err,
        });
        res.status(404);
      });
  } else {
    res.status(404).json({ message: "Plugin not found" });
    res.status(404);
  }
});

/// UPDATE MANY PLUGINS /////////////////////////////
module.exports.UpdateManyAudioPlugins = asyncHandler(async (req, res) => {
  const dataObjGroup = req.body.dataObj;
  console.log(
    "%c⚪️►►►► %cline:231%cdataObjGroup",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(89, 61, 67);padding:3px;border-radius:2px",
    dataObjGroup
  );

  const AudioPlugin = getAudioPluginModelAndCollection(req.user);

  // Convert strings to numbers where needed
  function groomObjectForDB(dataObj) {
    const requiresNumber = ["rating"];
    const requiresBoolean = ["oversampling", "favorite"];
    const newDataObj = {};

    const stringToBoolean = (string) => {
      switch (string.toLowerCase().trim()) {
        case "true":
        case "yes":
        case "1":
          return true;

        case "false":
        case "no":
        case "0":
        case null:
          return false;

        default:
          return Boolean(string);
      }
    };

    for (const key in dataObj) {
      if (requiresNumber.includes(key) && isNaN(dataObj[key])) {
        const newNumber = dataObj[key];
        newDataObj[key] = parseFloat(dataObj[key].replace('"', ""));
      } else if (
        requiresBoolean.includes(key) &&
        dataObj[key].constructor === String
      ) {
        newDataObj[key] = stringToBoolean(dataObj[key]);
      } else {
        newDataObj[key] = dataObj[key];
      }
    }

    return newDataObj;
  }

  ////////////////
  //Bulk Updates
  ////////////////
  let bulk_operations = [];

  for (var dataObj of Object.values(dataObjGroup)) {
    const groomedDataObject = groomObjectForDB(dataObj);

    bulk_operations.push({
      updateOne: {
        filter: { _id: groomedDataObject.dbID },
        update: groomedDataObject,
      },
    });
  }

  AudioPlugin.bulkWrite(bulk_operations)
    .then((bulkWriteOpResult) => {
      console.log("BULK update OK");
      res.status(200).json({
        message: "All items update successfully.",
        doc: bulkWriteOpResult,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        message: "Error when trying to save the plugin.",
        err: err,
      });
    });
});

module.exports.RemoveAudioPlugin = asyncHandler(async (req, res) => {
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);

  AudioPlugin.deleteOne({ _id: req.params.id })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.log("err", err);
      res
        .status(404)
        .json({ message: "Error when trying to save the plugin.", err: err });
      res.status(404);
    });
});

module.exports.RemoveAllAudioPlugins = asyncHandler(async (req, res) => {
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);
  AudioPlugin.deleteMany({})
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      console.log("err", err);
      res
        .status(404)
        .json({ message: "Error when trying to save the plugin.", err: err });
      res.status(404);
    });
});

module.exports.AudioPluginModel = asyncHandler(async (req, res) => {
  const audioPlugins = await audioPluginSchema;

  res.json({ model: audioPlugins });
});

////////////////////////////////////////////////////////////////
///       ADMIN ACCESS
////////////////////////////////////////////////////////////////
//getAdminAudioPlugins function to get all plugins for the admin
module.exports.getAdminAudioPlugins = asyncHandler(async (req, res) => {
  if (!req.user) res.status(401).json({ message: "Access not authorized" });

  if (!adminList["all-plugins"].includes(req.user._id))
    res
      .status(403)
      .json({ message: "Sorry, you do not have permission to access this." });
  const collection = "all-plugins";
  const AudioPlugin = mongoose.model(collection, audioPluginSchema);
  const audioPlugins = await AudioPlugin.find({});
  res.json(audioPlugins);
});

// getAudioPlugins function to get all plugins
module.exports.changeFieldNameInDB = asyncHandler(async (req, res) => {
  console.log("Get all plugins request", req);
  const AudioPlugin = getAudioPluginModelAndCollection();
  console.log("AudioPlugin", AudioPlugin);
  const audioPlugins = await AudioPlugin.update(
    { "name.additional": { $exists: true } },
    { $rename: { id: "identifier" } },
    false,
    true
  );
  console.log("******************");
  console.log("*** The DB was updated with a name change ***");
  console.log("******************");
});

// changeFieldNameInDB();

// admin@glassinteractive.com
