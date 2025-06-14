const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { validateClassification } = require('../middleware/validationMiddleware');

// Existing routes
router.get('/', inventoryController.showManagement);
router.get('/add-classification', inventoryController.showAddClassificationForm);
router.post('/add-classification', validateClassification, inventoryController.addClassification);
router.get('/add-inventory', inventoryController.showAddInventoryForm);
router.post('/add-inventory', validateInventory, inventoryController.addInventory);

// Vehicle detail route
router.get('/detail/:invId', inventoryController.buildByInventoryId);

router.get('/detail/:invId', inventoryController.showVehicleDetail);



// New route for intentional error testing (to be added later)
router.get('/throw-error', (req, res, next) => {
  // Throw an error to test error handling
  throw new Error("Intentional server error for testing");
});

module.exports = router;