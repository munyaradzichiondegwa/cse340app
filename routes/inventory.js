const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const { validateClassification, validateInventory } = require('../middleware/validationMiddleware');
const utilities = require("../utilities/");

// Inventory Management main page
router.get('/', utilities.handleErrors(inventoryController.buildManagement));

// Add Classification form display
router.get('/add-classification', utilities.handleErrors(inventoryController.buildAddClassification));

// Add Classification form submission
router.post('/add-classification', validateClassification, utilities.handleErrors(inventoryController.addClassification));

// Add Inventory form display
router.get('/add-inventory', utilities.handleErrors(inventoryController.buildAddInventory));

// Add Inventory form submission
router.post('/add-inventory', validateInventory, utilities.handleErrors(inventoryController.addInventory));

// Inventory by classification view
router.get('/classification/:classificationId', utilities.handleErrors(inventoryController.buildByClassificationId));

// Vehicle detail page
router.get('/detail/:invId', utilities.handleErrors(inventoryController.showVehicleDetail));

// Route to intentionally throw an error for testing
router.get('/throw-error', (req, res, next) => {
  throw new Error("Intentional server error for testing");
});

module.exports = router;
