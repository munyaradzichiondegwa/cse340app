const express = require('express');
const router = express.Router();

// Import the inventoryController
const inventoryController = require('../controllers/inventoryController');

// Import utility functions
const utility = require('../utilities/');

// Import classification validation middleware
const invValidate = require('../utilities/classification-validation');

// Route to build inventory by classification ID
router.get('/type/:classificationId', utility.handleErrors(inventoryController.buildByClassificationId));

// Route for vehicle detail
router.get('/detail/:invId', utility.handleErrors(inventoryController.showVehicleDetail));

// Route to build management view
router.get('/', utility.handleErrors(inventoryController.buildManagement));

// Route to deliver add-classification form
router.get('/add-classification', utility.handleErrors(inventoryController.buildAddClassification));

// Updated route to handle classification form POST with validation
router.post(
  '/add-classification',
  invValidate.classificationValidationRules(),  // apply validation rules
  invValidate.validateClassification,           // handle errors if any
  utility.handleErrors(inventoryController.addClassification)
);

// Route to trigger 500 error for testing
router.get('/throw-error', (req, res, next) => {
  throw new Error("Intentional server error for testing");
});

module.exports = router;
