// utilities/account-validation.js

// --- Required Dependencies ---
const { body, validationResult } = require("express-validator");

// --- Internal Modules ---
const utilities = require(".");
const accountModel = require("../models/account-model");

// --- Validation Object ---
const validate = {};

/* ==================================
 *  Registration Data Validation Rules
 * =============================== */
validate.registrationRules = () => {
  return [
    body("account_firstname").trim().isLength({ min: 1 }).withMessage("Please provide a first name."),
    body("account_lastname").trim().isLength({ min: 2 }).withMessage("Please provide a last name."),
    body("account_email").trim().isEmail().normalizeEmail().withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),
    body("account_password").trim().isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }).withMessage("Password does not meet requirements."),
  ];
};

/* ==================================
 * Check registration data and return errors or continue
 * =============================== */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ==================================
 *  Login Data Validation Rules
 *  >> THIS IS THE FUNCTION THAT MUST BE DEFINED AND EXPORTED <<
 * =============================== */
validate.loginRules = () => {
  return [
    body("account_email").trim().isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("account_password").trim().isLength({ min: 1 }).withMessage("Password is required."),
  ];
};

/* ==================================
 * Check login data and return errors or continue
 * =============================== */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

// --- Export Validation Object ---
// This line makes `validate.loginRules` and all other functions available for import.
module.exports = validate;