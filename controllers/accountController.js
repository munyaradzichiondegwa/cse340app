const utilities = require("../utilities");
const accountModel = require('../models/account-model');

/* Deliver login view */
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

/* Deliver registration view */
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

/* Process Registration */
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

/* Handle login form submission */
async function accountLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    // You can add real login logic here later (e.g. verify user credentials)

    // For now, just render the login page with any flash messages
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

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,   // exported for routes to use
};
