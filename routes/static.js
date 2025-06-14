const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const inventoryController = require("../controllers/inventoryController");


router.get("/custom", utilities.handleErrors(inventoryController.buildCustom));
router.get("/sedan", utilities.handleErrors(inventoryController.buildSedan));
router.get("/suv", utilities.handleErrors(inventoryController.buildSUV));
router.get("/truck", utilities.handleErrors(inventoryController.buildTruck));


module.exports = router;