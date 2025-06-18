const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const utilities = require('../utilities/');
const invValidate = require('../utilities/classification-validation');
const inventoryValidate = require('../utilities/inventory-validation');

// Inventory by classification (matches navigation URLs)
router.get(
  '/type/:classificationId',
  utilities.handleErrors(inventoryController.buildByClassificationId)
);

// Vehicle detail
router.get(
  '/detail/:invId',
  utilities.handleErrors(inventoryController.showVehicleDetail)
);

// Inventory management main page
router.get(
  '/',
  utilities.handleErrors(inventoryController.buildManagement)
);

// Add classification form display
router.get(
  '/add-classification',
  utilities.handleErrors(inventoryController.buildAddClassification)
);

// Add classification form submission
router.post(
  '/add-classification',
  invValidate.classificationValidationRules(),
  invValidate.validateClassification,
  utilities.handleErrors(inventoryController.addClassification)
);


router.get('/detail/:invId', utilities.handleErrors(inventoryController.showVehicleDetail));
router.get('/type/:classification_id', utilities.handleErrors(inventoryController.buildByClassificationId));

// Add inventory form display
router.get(
  '/add-inventory',
  utilities.handleErrors(inventoryController.buildAddInventory)
);

// Add inventory form submission
router.post(
  '/add-inventory',
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(inventoryController.addInventory)
);

// Test route to throw error
router.get('/throw-error', (req, res, next) => {
  throw new Error('Intentional server error for testing');
});

module.exports = router;
