const utilities = require("../utilities/");
const baseController = {};

// Home page controller
baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
  } catch (error) {
    console.error("🔥 Error in buildHome:", error.message);
    next(error); // Pass to global error handler
  }
};

module.exports = baseController;
