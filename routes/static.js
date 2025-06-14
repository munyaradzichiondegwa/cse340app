const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const utilities = require('../utilities');

router.get("/custom", utilities.handleErrors(invController.buildCustom));
router.get("/sedan", utilities.handleErrors(invController.buildSedan));
router.get("/suv", utilities.handleErrors(invController.buildSUV));
router.get("/truck", utilities.handleErrors(invController.buildTruck));


module.exports = router;