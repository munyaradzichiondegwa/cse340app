const classificationModel = require("../models/classification-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const NO_IMAGE = "/images/vehicles/no-image.png";
const NO_THUMBNAIL = "/images/vehicles/no-image-tn.png";

const inventoryController = {};

/* ***************************
 * Build inventory by classification view
 ************************** */
inventoryController.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data.length) {
      return res.status(404).render("errors/error", {
        title: "No Vehicles Found",
        message: "No vehicles found for this classification.",
        nav: await utilities.getNav(),
      });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name || "Vehicles";

    res.render("inventory/classification", {
      title: `${className} vehicles`,
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
inventoryController.showVehicleDetail = async (req, res, next) => {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getVehicleById(invId);

    if (!vehicle) {
      return res.status(404).render("errors/error", {
        title: "404 - Vehicle Not Found",
        message: "The vehicle you are looking for does not exist.",
        nav: await utilities.getNav(),
      });
    }

    // Format price and miles for display
    vehicle.inv_price_formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(vehicle.inv_price);

    vehicle.inv_miles_formatted = new Intl.NumberFormat("en-US").format(vehicle.inv_miles);

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav: await utilities.getNav(),
      vehicle,
    });
  } catch (error) {
    console.error("Error in showVehicleDetail:", error);
    next(error);
  }
};

/* ***************************
 * Inventory Management View
 ************************** */
inventoryController.buildManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("message"),
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Display Add Classification Form
 ************************** */
inventoryController.buildAddClassification = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Handle Add Classification Submission
 ************************** */
inventoryController.addClassification = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Display Add Inventory Form
 ************************** */
inventoryController.buildAddInventory = async function (req, res, next) {
  try {
    const classificationId = req.body?.classification_id || 0;
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classificationId);

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      message: req.flash("message"),
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: NO_IMAGE,
      inv_thumbnail: NO_THUMBNAIL,
      inv_price: "",
      inv_miles: "",
      inv_color: "",
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Handle Add Inventory Submission
 ************************** */
inventoryController.addInventory = async (req, res, next) => {
  try {
    let {
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
    } = req.body;

    // Set default image paths if empty or missing
    if (!inv_image || inv_image.trim() === "") {
      inv_image = NO_IMAGE;
    }
    if (!inv_thumbnail || inv_thumbnail.trim() === "") {
      inv_thumbnail = NO_THUMBNAIL;
    }

    const result = await invModel.addInventoryItem(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    );

    if (result) {
      req.flash("message", `${inv_make} ${inv_model} added successfully.`);
      return res.redirect("/inv/management");
    }

    // If insertion failed, reload the form with errors and sticky form data
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: [{ msg: "Failed to add vehicle. Please try again." }],
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
  } catch (error) {
    console.error("Error in addInventory:", error);
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: [{ msg: "Database error: " + error.message }],
      ...req.body,
    });
  }
};

module.exports = inventoryController;
