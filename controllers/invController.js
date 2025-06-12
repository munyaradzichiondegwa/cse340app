const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build single inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const invId = req.params.inv_id;
    const data = await invModel.getInventoryById(invId);
    const html = utilities.buildDetailView(data);
    const nav = await utilities.getNav();
    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      html,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
