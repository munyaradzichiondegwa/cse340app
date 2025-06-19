const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/invController');
const utilities = require("../utilities/");
const classificationValidate = require('../utilities/classification-validation'); // New import for classification validation
const inventoryValidation = require('../utilities/inventory-validation'); // For inventory item validation

// Middleware to protect inventory management routes
const auth = utilities.checkAuthorization;

// Inventory by classification (Public)
router.get('/type/:classification_id', utilities.handleErrors(inventoryController.buildByClassificationId));

// Vehicle detail (Public)
router.get('/detail/:invId', utilities.handleErrors(inventoryController.showVehicleDetail));

// Inventory management main page (Protected)
router.get('/', auth, utilities.handleErrors(inventoryController.buildManagement));

// Add classification form display (Protected)
router.get('/add-classification', auth, utilities.handleErrors(inventoryController.buildAddClassification));

// Add classification form submission (Protected)
router.post(
    '/add-classification',
    auth,
    classificationValidate.classificationValidationRules(), // Using classification-specific validation
    classificationValidate.validateClassification, // Using classification-specific validation
    utilities.handleErrors(inventoryController.addClassification)
);

// Add inventory form display (Protected)
router.get('/add-inventory', auth, utilities.handleErrors(inventoryController.buildAddInventory));

// Add inventory form submission (Protected)
router.post(
    '/add-inventory',
    auth,
    inventoryValidation.inventoryRules(),
    inventoryValidation.checkInventoryData,
    utilities.handleErrors(inventoryController.addInventory)
);

// Route to build the edit inventory view (Protected)
router.get("/edit/:inv_id", auth, utilities.handleErrors(inventoryController.buildEditInventoryView));

// Update inventory submission (Protected)
router.post(
    "/update",
    auth,
    inventoryValidation.inventoryRules(),
    inventoryValidation.checkUpdateData,
    utilities.handleErrors(inventoryController.updateInventory)
);

// Route to build the delete confirmation view (Protected)
router.get("/delete/:inv_id", auth, utilities.handleErrors(inventoryController.buildDeleteConfirmationView));

// Route to handle the delete submission (Protected)
router.post("/delete", auth, utilities.handleErrors(inventoryController.deleteInventoryItem));

// Fetch inventory via AJAX (Protected, as it's for the management view)
router.get('/getInventory/:classification_id', auth, utilities.handleErrors(inventoryController.getInventoryJSON));

module.exports = router;