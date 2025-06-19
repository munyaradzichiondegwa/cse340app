const { body, validationResult } = require("express-validator");
const utilities = require("../utilities/"); // utilities is used by checkClassificationData, checkInventoryData, checkUpdateData

/*  **************************************
 *  Rules for adding a new classification
 * ************************************** */
exports.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name."),
  ];
};

/* *************************************
 *  Rules for adding new inventory item - renamed to inventoryRules
 * ************************************ */
exports.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a make for the vehicle."),
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a model for the vehicle."),
    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a description for the vehicle."),
    body("inv_image") // Corrected from inv_image_path based on invController.js
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide an image path for the vehicle."),
    body("inv_thumbnail") // Corrected from inv_thumbnail_path based on invController.js
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a thumbnail path for the vehicle."),
    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Please provide a price for the vehicle.")
      .custom((value) => {
        if (value < 0) {
          throw new Error("Price cannot be negative.");
        }
        return true;
      }),
    body("inv_year")
      .trim()
      .isNumeric()
      .withMessage("Please provide a year for the vehicle."),
    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Please provide miles for the vehicle."),
    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a color for the vehicle."),
    body("classification_id")
      .trim()
      .isNumeric()
      .withMessage("Please provide a classification id for the vehicle."),
  ];
};

/* *************************************
 *  Check data and return errors or continue
 * ************************************ */
exports.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList();
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList: classificationList,
      errors: errors,
    });
    return;
  }
  next();
};

/* *************************************
 *  Check data and return errors or continue
 * ************************************ */
exports.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList();
    let nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList: classificationList,
      errors: errors,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image, // Corrected field name
      inv_thumbnail: req.body.inv_thumbnail, // Corrected field name
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    });
    return;
  }
  next();
};

/* *************************************
 *  Check update data and return errors or continue
 * ************************************ */
exports.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav();
    const itemData = { ...req.body }; // Create a copy to avoid modifying req.body directly

    res.render("inventory/edit-inventory", {
      title: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      classificationList: classificationList,
      itemData: itemData,
      errors: errors,
    });
    return;
  }
  next();
};