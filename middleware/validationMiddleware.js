const { body, validationResult } = require('express-validator');

exports.validateClassification = [
  body('classification_name')
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Classification name must be alphanumeric with no spaces or special characters.')
    .notEmpty()
    .withMessage('Classification name is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Pass errors back to the view
      return res.status(400).render('inventory/add-classification', {
        errors: errors.array(),
        message: null,
      });
    }
    next();
  },
];


const { body, validationResult } = require('express-validator');

// Server-side validation for inventory form
exports.validateInventory = [
  body('classification_id')
    .notEmpty()
    .withMessage('Please select a classification.'),
  body('inv_make')
    .trim()
    .notEmpty()
    .withMessage('Make is required.')
    .isLength({ max: 30 })
    .withMessage('Make cannot exceed 30 characters.'),
  body('inv_model')
    .trim()
    .notEmpty()
    .withMessage('Model is required.')
    .isLength({ max: 30 })
    .withMessage('Model cannot exceed 30 characters.'),
  body('inv_year')
    .notEmpty()
    .withMessage('Year is required.')
    .isInt({ min: 1886, max: new Date().getFullYear() + 1 }) // Cars invented ~1886
    .withMessage('Year must be a valid year.'),
  body('inv_description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),
  body('inv_price')
    .notEmpty()
    .withMessage('Price is required.')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('inv_miles')
    .notEmpty()
    .withMessage('Mileage is required.')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number.'),
  body('inv_color')
    .trim()
    .notEmpty()
    .withMessage('Color is required.')
    .isLength({ max: 20 })
    .withMessage('Color cannot exceed 20 characters.'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Save errors and input values, re-render with sticky inputs
      req.validationErrors = errors.array();
      return next();
    }
    next();
  },
];
