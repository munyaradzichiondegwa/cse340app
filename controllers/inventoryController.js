const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 * Build inventory by classification view
 ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Vehicles";
    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Show vehicle detail view
 ************************** */
invCont.showVehicleDetail = async (req, res, next) => {
  const invId = req.params.invId;
  try {
    const vehicle = await invModel.getVehicleById(invId);
    if (!vehicle) {
      return res.status(404).render('errors/error', {
        title: '404 - Vehicle Not Found',
        message: 'The vehicle you are looking for does not exist.',
        nav: await utilities.getNav()
      });
    }

    vehicle.inv_price_formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price);
    vehicle.inv_miles_formatted = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

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

/* ***************************
 * Inventory Management View
 ************************** */
invCont.buildManagement = async (req, res) => {
  const nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
  });
};

/* ***************************
 * Display Add Classification Form
 ************************** */
invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 * Handle Add Classification Submission
 ************************** */
invCont.addClassification = async (req, res) => {
  let { classification_name } = req.body;
  classification_name = classification_name.trim();
  const result = await invModel.addClassification(classification_name);

  const nav = await utilities.getNav();
  if (result) {
    req.flash("message", "Classification added successfully.");
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("message"),
    });
  } else {
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [{ msg: "Classification could not be added." }],
    });
  }
};

/* ***************************
 * Display Add Inventory Form
 ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    // Used for sticky select in case of validation errors
    const classificationId = req.body?.classification_id || 0;
    const classificationList = await utilities.buildClassificationList(classificationId);

    res.render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      classificationList,
      errors: null,
      message: req.flash("message"),
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '/images/vehicles/no-image.png',
      inv_thumbnail: '/images/vehicles/no-image.png',
      inv_price: '',
      inv_miles: '',
      inv_color: ''
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Handle Add Inventory Submission
 ************************** */
invCont.addInventory = async (req, res) => {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image = '/images/vehicles/no-image.png',
      inv_thumbnail = '/images/vehicles/no-image.png',
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });

    if (result) {
      req.flash("message", "Inventory item added.");
      const nav = await utilities.getNav();
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("message"),
      });
    } else {
      const classificationList = await utilities.buildClassificationList(classification_id);
      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        classificationList,
        errors: [{ msg: "Failed to add inventory." }],
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }
  } catch (error) {
    console.error("Error in addInventory:", error);
    res.status(500).render("errors/error", {
      title: "Error",
      message: "Failed to add inventory due to a server error.",
      nav: await utilities.getNav()
    });
  }
};

module.exports = invCont;
