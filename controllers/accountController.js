// --- Required Dependencies ---
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

// --- Internal Modules ---
const utilities = require("../utilities");
const accountModel = require('../models/account-model');


/* ========================================
 * Deliver Login View
 * Renders the login page for the user.
 *
 * >> THIS IS THE FUNCTION THAT WAS CAUSING THE ERROR <<
 * Ensure this function exists and the name is spelled correctly.
 * ===================================== */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      message: req.flash('notice') || null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { buildLogin }
/* ========================================
 * Deliver Registration View
 * Renders the registration page for the user.
 * ===================================== */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}


/* ========================================
 * Process Registration
 * Handles the submission of the registration form.
 * ===================================== */
async function registerAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      res.status(201).redirect('/account/login');
    } else {
      res.status(501).render("account/register", {
        title: "Register",
        nav,
        message: "Sorry, the registration failed.",
        errors: null,
        account_firstname,
        account_lastname,
        account_email
      });
    }
  } catch (error) {
    next(error);
  }
}


/* ========================================
 * Process login request
 * Authenticates the user based on submitted credentials.
 * ===================================== */
async function accountLogin(req, res, next) { // Note: Added 'next' for error handling
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }

      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    // Pass the error to the global error handler
    return next(new Error('Access Forbidden'));
  }
}


/* ========================================
 * Deliver Account Management View
 * Renders the main account view for a logged-in user.
 * ===================================== */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      message: req.flash('notice') || null,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}


// --- Export Controller Functions ---
// All functions must be defined above this block.
// The name used here must exactly match the function name defined above.
module.exports = {
  buildLogin, // << The ReferenceError pointed to this line.
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement
};