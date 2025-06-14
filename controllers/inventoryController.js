const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Show vehicle detail view
 ************************** */
invCont.showVehicleDetail = async (req, res, next) => {
  const invId = req.params.invId;
  try {
    const vehicle = await invModel.getVehicleById(invId);
    console.log(">> DB vehicle result: ", vehicle);
    if (!vehicle) {
      return res.status(404).render('errors/error', {
        title: '404 - Vehicle Not Found',
        message: 'The vehicle you are looking for does not exist.',
        nav: await utilities.getNav()
      });
    }

    // Format price and miles
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    vehicle.inv_price_formatted = formatter.format(vehicle.inv_price);
    vehicle.inv_miles_formatted = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

    console.log(">> Formatted vehicle object: ", vehicle);
    
    // Render the EJS view with the vehicle object
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav: await utilities.getNav(),
      vehicle,
    });
  } catch (error) {
    console.error("Error in showVehicleDetail: ", error);
    next(error);
  }
};

module.exports = invCont;
