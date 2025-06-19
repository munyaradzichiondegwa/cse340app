const { body, validationResult } = require('express-validator');
const utilities = require('../utilities');
const invModel = require('../models/inventory-model');

const invValidate = {};

// Inventory validation rules
invValidate.inventoryRules = () => {
  return [
    body('classification_id')
      .isInt({ min: 1 })
      .withMessage('Classification must be selected.'),
    body('inv_make')
      .trim()
      .notEmpty()
      .withMessage('Make is required.'),
    body('inv_model')
      .trim()
      .notEmpty()
      .withMessage('Model is required.'),
    body('inv_year')
      .isInt({ min: 1900, max: 2099 })
      .withMessage('Enter a valid year between 1900 and 2099.'),
    body('inv_description')
      .trim()
      .notEmpty()
      .withMessage('Description is required.'),
    body('inv_image')
      .trim()
      .notEmpty()
      .withMessage('Image path is required.'),
    body('inv_thumbnail')
      .trim()
      .notEmpty()
      .withMessage('Thumbnail path is required.'),
    body('inv_price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number.'),
    body('inv_miles')
      .isInt({ min: 0 })
      .withMessage('Mileage must be a non-negative number.'),
    body('inv_color')
      .trim()
      .notEmpty()
      .withMessage('Color is required.')
  ];
};

// Middleware to check and respond to add-inventory validation result
invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    return res.render('inventory/add-inventory', {
      title: 'Add New Inventory Item',
      nav,
      classificationList,
      errors: errors.array(),
      message: null,
      ...req.body,
    });
  }
  next();
};

/* **********************************
 * Check data and return errors or continue to update
 * **********************************/
invValidate.checkUpdateData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    return res.render('inventory/edit-inventory', {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
  next();
};

module.exports = invValidate;