const {
  getAudioPlugins,
  getAudioPluginBy_Id,
  getAudioPluginByHashId,
  AddAudioPlugin,
  AddManyAudioPlugins,
  UpdateAudioPlugin,
  RemoveAudioPlugin,
  RemoveAllAudioPlugins,
  AudioPluginModel,
  getAdminAudioPlugins,
} = require("../controllers/audioPluginController.js");
const express = require("express");

const router = express.Router();

// express router method to create route for adding an audio plugin
router.route("/add").post(AddAudioPlugin);

// express router method to create route for adding an audio plugin
router.route("/add-many").post(AddManyAudioPlugins);

// express router method to create route for removing an audio plugin
router.route("/deleteAll").get(RemoveAllAudioPlugins);

// express router method to create route for removing an audio plugin
router.route("/:id/delete").get(RemoveAudioPlugin);

// express router method to create route for updating an audio plugin
router.route("/update").post(UpdateAudioPlugin);

// express router method to create route for updating an audio plugin
router.route("/model").get(AudioPluginModel);

// express router method to create route for getting all audio tools
router.route("/admin/allAudioTools").get(getAdminAudioPlugins);

// express router method to create route for getting users by id
router.route("/hash-id/:hashid").get(getAudioPluginByHashId);

// express router method to create route for getting users by id
router.route("/:id").get(getAudioPluginBy_Id);

// express router method to create route for an admin to get all tools
router.route("/").post(getAudioPlugins);

module.exports =  router;
