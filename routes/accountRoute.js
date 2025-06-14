const express = require("express");
const router = express.Router();

const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Show login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Show registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Handle registration form submission with validation middleware
router.post(
  "/register",
  regValidate.registrationRules(),   // runs validation rules
  regValidate.checkRegData,          // checks validation results, renders errors if any
  utilities.handleErrors(accountController.registerAccount) // calls controller function if no errors
);

// Handle login form submission
router.post(
  "/login",
  utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;
