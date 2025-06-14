const express = require('express');
const router = express.Router();

// Import the inventoryController
const inventoryController = require('../controllers/inventoryController');

// Import utility functions
const utilities = require('../utilities/');

// Import classification validation middleware
const invValidate = require('../utilities/classification-validation');

// Import inventory validation middleware (for add-inventory)
const inventoryValidate = require('../utilities/inventory-validation');

// Route to build inventory by classification ID
router.get(
  '/type/:classificationId',
  utilities.handleErrors(inventoryController.buildByClassificationId)
);

// Route for vehicle detail
router.get(
  '/detail/:invId',
  utilities.handleErrors(inventoryController.showVehicleDetail)
);

// Route to build management view
router.get('/', utilities.handleErrors(inventoryController.buildManagement));

// Route to build add inventory view
router.get('/add', utilities.handleErrors(inventoryController.buildAddInventory));

// Route to deliver add-classification form
router.get(
  '/add-classification',
  utilities.handleErrors(inventoryController.buildAddClassification)
);

// Route to handle classification form POST with validation
router.post(
  '/add-classification',
  invValidate.classificationValidationRules(),  // apply validation rules
  invValidate.validateClassification,           // handle validation errors if any
  utilities.handleErrors(inventoryController.addClassification)
);

// *** Add Inventory Routes ***

// GET add-inventory form
router.get('/add-inventory', utilities.handleErrors(inventoryController.buildAddInventory));

// POST add-inventory form submission with validation
router.post(
  '/add-inventory',
  inventoryValidate.inventoryRules(),      // validation rules for inventory
  inventoryValidate.checkInventoryData,    // error handler middleware
  utilities.handleErrors(inventoryController.addInventory)
);

// Route to trigger 500 error for testing
router.get('/throw-error', (req, res, next) => {
  throw new Error('Intentional server error for testing');
});

module.exports = router;
