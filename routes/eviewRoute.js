const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/"); // For handleErrors and checkLogin
const reviewValidate = require("../utilities/review-validation"); // For review validation

// Route to process new review submission
router.post(
  "/add-review",
  utilities.checkLogin, // Ensure user is logged in to submit a review
  reviewValidate.reviewRules(), // Apply validation rules
  reviewValidate.checkReviewData, // Check validation results
  utilities.handleErrors(reviewController.addReview)
);

module.exports = router;