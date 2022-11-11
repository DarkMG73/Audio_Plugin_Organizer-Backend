import audioPluginSchema from "../models/pluginModel.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import adminList from "../data/adminList.js";

function getAudioPluginModelAndCollection(user) {
  let collection = user ? user._id : "all-plugins";
  if (user && adminList["all-plugins"].includes(user._id)) {
    collection = "all-plugins";
  }
  return mongoose.model(collection, audioPluginSchema);
}
// getAudioPlugins function to get all plugins
export const getAudioPlugins = asyncHandler(async (req, res) => {
  console.log("Get all plugins request", req);
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);
  const audioPlugins = await AudioPlugin.find({});
  res.json(audioPlugins);
});

// getAudioPluginBy_Id function to retrieve user by id
export const getAudioPluginBy_Id = asyncHandler(async (req, res) => {
  console.log("GET PLUGIN BY ID -> ", req);
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
export const getAudioPluginByHashId = asyncHandler(async (req, res) => {
  console.log("GET PLUGIN BY HASH ID -> ", req);
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);
  const hashId = req.params.hashId;
  console.log("hashId", hashId);
  const filter = { id: hashId };
  console.log("_______filter_______", filter);

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
export const AddAudioPlugin = asyncHandler(async (req, res, next) => {
  console.log("Saving A Plugin");
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
export const AddManyAudioPlugins = asyncHandler(async (req, res, next) => {
  console.log("Saving Multiple Plugins");
  const audioPlugin = req.body.theData;
  console.log("audioPlugin", audioPlugin);

  console.log("req.body", req.body);
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
export const UpdateAudioPlugin = asyncHandler(async (req, res) => {
  const dataObj = req.body.theDataObj;
  // console.log("req", req);
  console.log("dataObj", dataObj);
  const AudioPlugin = getAudioPluginModelAndCollection(req.user);
  console.log("AudioPlugin", AudioPlugin);
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
        console.log("key");
        const newNumber = dataObj[key];

        newDataObj[key] = parseFloat(dataObj[key].replace('"', ""));
      } else if (requiresBoolean.includes(key)) {
        if (dataObj[key].constructor === String) {
          newDataObj[key] = stringToBoolean(dataObj[key]);
        }
      } else {
        newDataObj[key] = dataObj[key];
      }
    }

    return newDataObj;
  }

  const groomedDataObject = groomObjectForDB(dataObj);
  console.log("groomedDataObject", groomedDataObject);

  const identifier = groomedDataObject.identifier;
  console.log("Update a Plugin -> ", identifier);
  console.log("identifier", identifier);
  const filter = { identifier: identifier };
  console.log("_______filter_______", filter);

  const audioPlugin = await AudioPlugin.findOne(filter);
  console.log("audioPlugin", audioPlugin);
  if (audioPlugin.identifier === identifier) {
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

export const RemoveAudioPlugin = asyncHandler(async (req, res) => {
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

export const RemoveAllAudioPlugins = asyncHandler(async (req, res) => {
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

export const AudioPluginModel = asyncHandler(async (req, res) => {
  const audioPlugins = await audioPluginSchema;

  res.json({ model: audioPlugins });
});

////////////////////////////////////////////////////////////////
///       ADMIN ACCESS
////////////////////////////////////////////////////////////////
//getAdminAudioPlugins function to get all plugins for the admin
export const getAdminAudioPlugins = asyncHandler(async (req, res) => {
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
export const changeFieldNameInDB = asyncHandler(async (req, res) => {
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
