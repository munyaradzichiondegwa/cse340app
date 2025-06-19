// routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation'); // Required for validation rules

// Account management view (protected)
router.get(
  "/",
  utilities.checkLogin, // Ensure user is logged in
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Registration handler
router.post(
  "/register",
  regValidate.registrationRules(), // Validation rules for registration
  regValidate.checkRegData, // Check data and handle errors
  utilities.handleErrors(accountController.registerAccount)
);

// Login handler
router.post(
  "/login",
  regValidate.loginRules(), // Validation rules for login
  regValidate.checkLoginData, // Check data and handle errors
  utilities.handleErrors(accountController.accountLogin)
);

// Logout route
router.get("/logout", accountController.logout);

// Account update view (protected)
router.get(
  "/update/:accountId",
  utilities.checkLogin, // Ensure user is logged in
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

// Account info update handler
router.post(
  "/update",
  regValidate.updateAccountRules(), // Validation rules for account info update
  regValidate.checkUpdateData, // Check data and handle errors
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Password update handler
router.post(
  "/update-password",
  regValidate.passwordRules(), // Validation rules for password change
  regValidate.checkPasswordData, // Check data and handle errors
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;