const express = require("express");
const router = express.Router();

const baseController = require("../controllers/baseController");
const utilities = require("../utilities/");
const invController = require("../controllers/invController");

// Static Routes
// Serve static assets
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "/../public/css"));
router.use("/js", express.static(__dirname + "/../public/js"));
router.use("/images", express.static(__dirname + "/../public/images"));

// Route to homepage
router.get("/", utilities.handleErrors(baseController.buildHome));

// Route to classification
router.get("/classify/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

module.exports = router;

