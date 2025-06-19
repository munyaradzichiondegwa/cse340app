const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/invController');
const utilities = require("../utilities/");
const classificationValidate = require('../utilities/classification-validation');
const inventoryValidate = require('../utilities/inventory-validation');

// --- GET Routes ---

// Inventory Management main page
router.get('/', utilities.handleErrors(inventoryController.buildManagement));

// Add Classification form display
router.get('/add-classification', utilities.handleErrors(inventoryController.buildAddClassification));

// Add Inventory form display
router.get('/add-inventory', utilities.handleErrors(inventoryController.buildAddInventory));

// Route to build the edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(inventoryController.buildEditInventoryView));

// Vehicle detail page
router.get('/detail/:invId', utilities.handleErrors(inventoryController.showVehicleDetail));

// Inventory by classification view
router.get('/type/:classification_id', utilities.handleErrors(inventoryController.buildByClassificationId));

// --- POST Routes ---

// Add Classification form submission
router.post(
    '/add-classification',
    classificationValidate.classificationValidationRules(),
    classificationValidate.validateClassification,
    utilities.handleErrors(inventoryController.addClassification)
);

// Add Inventory form submission
router.post(
    '/add-inventory',
    inventoryValidate.inventoryRules(),
    inventoryValidate.checkInventoryData,
    utilities.handleErrors(inventoryController.addInventory)
);

// --- AJAX Route ---

// This is the route that the client-side JavaScript will call
router.get(
    '/getInventory/:classification_id',
    utilities.handleErrors(inventoryController.getInventoryJSON)
);

module.exports = router;