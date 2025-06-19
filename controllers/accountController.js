const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const reviewModel = require("../models/review-model"); // ADDED: For review functionality

const accountController = {};

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    messages: req.flash() // Ensure messages are passed
  });
};

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    messages: req.flash() // Ensure messages are passed
  });
};

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        messages: req.flash() // Ensure messages are passed
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        messages: req.flash() // Ensure messages are passed
      });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    req.flash("notice", "Sorry, there was an error processing the registration.");
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      messages: req.flash() // Ensure messages are passed
    });
  }
};

/* ****************************************
*  Process login request
* *************************************** */
accountController.accountLogin = async function (req, res) {
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
      messages: req.flash() // Ensure messages are passed
    });
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password);
    if (match) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 }); // expiresIn in seconds
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 }); // maxAge in milliseconds
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again."); // Standardized flash key
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        messages: req.flash() // Ensure messages are passed
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    req.flash("notice", "An unexpected error occurred. Please try again."); // More robust error message
    res.redirect("/account/login"); // Redirect to login on unexpected error
  }
};

/* ****************************************
*  Deliver account management view
* *************************************** */
accountController.buildAccountManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash() // Ensure messages are passed
  });
};

/* ****************************************
*  Deliver account update view
* *************************************** */
accountController.buildUpdateAccountView = async function (req, res, next) {
  const account_id = parseInt(req.params.accountId);
  const nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(account_id);

  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    errors: null,
    messages: req.flash(), // Ensure messages are passed
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  });
};

/* ****************************************
*  Process Account Information Update
* *************************************** */
accountController.updateAccountInfo = async function (req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);

  if (updateResult) {
    // Re-sign JWT with updated account data
    const updatedAccountData = await accountModel.getAccountById(account_id);
    const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 }); // expiresIn in seconds
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 }); // maxAge in milliseconds
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
    }

    req.flash("notice", "Your account information has been successfully updated.");
    res.redirect("/account/");
  } else {
    const nav = await utilities.getNav();
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      messages: req.flash(), // Ensure messages are passed
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
*  Process Password Change
* *************************************** */
accountController.updatePassword = async function (req, res) {
  const { account_id, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Your password has been successfully updated.");
      res.redirect("/account/");
    } else {
      const nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(account_id);
      req.flash("notice", "Sorry, the password update failed.");
      res.status(501).render("account/update-account", {
        title: "Update Account Information",
        nav,
        errors: null,
        messages: req.flash(), // Ensure messages are passed
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
      });
    }
  } catch (error) {
    console.error("Password Update Error:", error);
    req.flash("notice", "An unexpected error occurred.");
    res.redirect("/account/");
  }
};

/* ****************************************
 *  Deliver My Reviews view
 * *************************************** */
accountController.buildMyReviews = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id; // Get account_id from res.locals
    const myReviews = await reviewModel.getReviewsByAccountId(account_id); // Fetch reviews for this user
    const nav = await utilities.getNav();

    res.render("account/my-reviews", { // New EJS file
      title: "My Reviews",
      nav,
      myReviews, // Pass reviews to the view
      errors: null,
      messages: req.flash(),
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 *  Process logout request
 * ************************************ */
accountController.logout = (req, res) => {
  res.clearCookie("jwt"); // Clear the JWT cookie
  req.session?.destroy(() => { // Destroy the session (if using sessions)
    req.flash("notice", "You have been logged out.");
    res.redirect("/");
  });
};

module.exports = accountController;