const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Show login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Show registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Handle registration form submission
router.post("/register", utilities.handleErrors(accountController.registerAccount))


// Handle login form submission
router.post('/register', utilities.handleErrors(accountController.registerAccount))

// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

module.exports = router