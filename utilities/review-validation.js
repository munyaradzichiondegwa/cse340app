const { body, validationResult } = require("express-validator");
const utilities = require("."); // Assuming utilities/index.js
const reviewModel = require("../models/review-model"); // For potential custom validation

const validate = {};

/* ***********************************
 * Review Submission Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    body("review_rating")
      .trim()
      .notEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be a number between 1 and 5."),

    body("review_text")
      .trim()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Review text must be at least 10 characters long.")
      .isLength({ max: 500 })
      .withMessage("Review text cannot exceed 500 characters."),

    // inv_id and account_id are usually passed as hidden fields or from session
    // and should be validated for existence and type, but not necessarily content here.
    // Assuming they are handled by controller logic or other middleware.
  ];
};

/* ******************************
 * Check review data
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_rating, review_text } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // If there are errors, we need to re-render the vehicle detail page
    // This requires fetching vehicle data and existing reviews again
    const invModel = require("../models/inventory-model"); // Import here to avoid circular dependency
    const inventory = await invModel.getInventoryById(inv_id);
    const reviews = await reviewModel.getReviewsByInvId(inv_id);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${inventory.inv_make} ${inventory.inv_model} details`,
      nav,
      inventory,
      reviews, // Pass existing reviews
      review_rating, // Pass back submitted rating for stickiness
      review_text, // Pass back submitted text for stickiness
      errors: errors.array(),
      messages: req.flash(),
      // Ensure accountData is available for the form (from checkJWTToken)
      accountData: res.locals.accountData || null,
    });
    return;
  }
  next();
};

module.exports = validate;