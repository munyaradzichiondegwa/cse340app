const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");


// Show login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Show registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// POST route to process registration with validation middleware
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Handle login form submission
router.post("/login", utilities.handleErrors(accountController.accountLogin));

module.exports = router;
