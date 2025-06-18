// routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');

// Route to build the account management view.
// *** THIS ROUTE IS NOW PROTECTED BY THE checkLogin MIDDLEWARE ***
router.get(
  "/",
  utilities.checkLogin, // Authorization check runs first
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Route to build login page view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration page view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data, with validation middleware
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt, with validation middleware
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;