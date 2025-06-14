const express = require('express');
const router = express.Router();

// Import the inventoryController with the variable name 'inventoryController'
const inventoryController = require('../controllers/inventoryController');

// Import utility functions
const utility = require('../utilities/');

// Route to build inventory by classification ID (example route)

router.get('/type/:classificationId', utility.handleErrors(inventoryController.buildByClassificationId));

// Route for vehicle detail, using the showVehicleDetail method
router.get('/detail/:invId', utility.handleErrors(inventoryController.showVehicleDetail));

router.get('/throw-error', (req, res, next) => {
    throw new Error("Intentional server error for testing");
  });

module.exports = router;