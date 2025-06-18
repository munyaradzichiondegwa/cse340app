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
  const classification_id = req.params.classification_id;
  console.log("Requested classification_id:", classification_id);

  try {
    // Fetch inventory vehicles for the classification
    const vehicles = await invModel.getInventoryByClassificationId(classification_id);
    console.log("Vehicles found:", vehicles.length);

    // Fetch classification list to get the name of current classification
    const classificationsData = await classificationModel.getClassifications();
    // classificationsData is array of classification objects
    const classification = classificationsData.find(c => c.classification_id == classification_id);
    const className = classification ? classification.classification_name : "Vehicles";

    const grid = await utilities.buildClassificationGrid(vehicles);
    const nav = await utilities.getNav();

    if (vehicles.length > 0) {
      res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
      });
    } else {
      res.render("./inventory/classification", {
        title: "No vehicles found for this classification",
        nav,
        grid,
      });
    }
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    next(error);
  }
};

/* ***************************
 * Show vehicle detail view
 ************************** */
inventoryController.showVehicleDetail = async (req, res, next) => {
  const invId = req.params.invId;
  try {
    const vehicle = await invModel.getVehicleById(invId);

    if (!vehicle) {
      // If no vehicle found, show 404 error page
      return res.status(404).render('errors/404', {
        title: "Vehicle Not Found",
        message: "Sorry, we could not find that vehicle."
      });
    }

    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle); // sync function assumed
    const nav = await utilities.getNav();

    res.render('inventory/detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      grid: vehicleHTML,
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

    // Set default image paths if empty
    if (!inv_image || inv_image.trim() === "") inv_image = NO_IMAGE;
    if (!inv_thumbnail || inv_thumbnail.trim() === "") inv_thumbnail = NO_THUMBNAIL;

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
      req.flash("message", `${inv_make} ${inv_model} added successfully.`);
      return res.redirect("/inv/management");
    }

    // If insertion failed
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
