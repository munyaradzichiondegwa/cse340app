const utilities = require("../utilities/");
const reviewModel = require("../models/review-model");

const reviewController = {};

/* ****************************************
 *  Process new review submission
 * *************************************** */
reviewController.addReview = async function (req, res, next) {
  const { inv_id, review_rating, review_text } = req.body;
  const account_id = res.locals.accountData.account_id; // Get account_id from res.locals (set by checkJWTToken)

  const reviewResult = await reviewModel.addReview(
    inv_id,
    account_id,
    review_text,
    review_rating
  );

  if (reviewResult) {
    req.flash("notice", "Review submitted successfully!");
    res.status(201).redirect(`/inv/detail/${inv_id}`); // Redirect back to vehicle detail page
  } else {
    req.flash("notice", "Sorry, review submission failed.");
    // If it fails, re-render the detail page with error
    const invModel = require("../models/inventory-model");
    const inventory = await invModel.getInventoryById(inv_id);
    const reviews = await reviewModel.getReviewsByInvId(inv_id);
    const nav = await utilities.getNav();

    res.status(500).render("inventory/detail", {
      title: `${inventory.inv_make} ${inventory.inv_model} details`,
      nav,
      inventory,
      reviews,
      review_rating,
      review_text,
      errors: null, // Errors would be handled by validation middleware if any
      messages: req.flash(),
      accountData: res.locals.accountData || null,
    });
  }
};

module.exports = reviewController;