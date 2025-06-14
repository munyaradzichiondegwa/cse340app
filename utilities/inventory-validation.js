const { body, validationResult } = require('express-validator');

const invValidate = {};

// Inventory validation rules
invValidate.inventoryRules = () => {
  return [
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
      .withMessage('Color is required.'),
    body('classification_id')
      .isInt({ min: 1 })
      .withMessage('Classification must be selected.')
  ];
};

// Middleware to check and respond to validation result
invValidate.checkInventoryData = async (req, res, next) => {
  const { validationResult } = require('express-validator');
  const utilities = require('../utilities');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);

    return res.render('inventory/add-inventory', {
      title: 'Add New Inventory Item',
      classificationList,
      errors: errors.array(),
      message: null,
      // Sticky inputs
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    });
  }
  next();
};

module.exports = invValidate;
