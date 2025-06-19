const utilities = require("../utilities/");
const baseController = {};

// Home page controller
baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav(); 
    const message = req.flash("notice");
    res.render("index", {
      title: "Home",
      nav,
      message
    });
  } catch (error) {
    console.error("🔥 Error in buildHome:", error.message);
    next(error); // Pass to global error handler
  }
};

module.exports = baseController;
