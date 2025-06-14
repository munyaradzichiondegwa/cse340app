const { body, validationResult } = require('express-validator');

exports.validateClassification = [
  body('classification_name')
    .trim()
    .notEmpty().withMessage('Classification name is required.')
    .bail()
    .matches(/^[A-Za-z0-9]+$/).withMessage('Classification name must be alphanumeric with no spaces or special characters.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('inventory/add-classification', {
        errors: errors.array(),
        message: null,
        classification_name: req.body.classification_name,
        nav: req.nav || null,
      });
    }
    next();
  },
];

exports.validateInventory = [
  body('classification_id')
    .notEmpty().withMessage('Please select a classification.')
    .bail()
    .isInt().withMessage('Invalid classification selected.'),
  body('inv_make')
    .trim()
    .notEmpty().withMessage('Make is required.')
    .bail()
    .isLength({ max: 30 }).withMessage('Make cannot exceed 30 characters.'),
  body('inv_model')
    .trim()
    .notEmpty().withMessage('Model is required.')
    .bail()
    .isLength({ max: 30 }).withMessage('Model cannot exceed 30 characters.'),
  body('inv_year')
    .notEmpty().withMessage('Year is required.')
    .bail()
    .isInt({ min: 1886, max: new Date().getFullYear() + 1 }).withMessage('Year must be a valid year.'),
  body('inv_description')
    .trim()
    .notEmpty().withMessage('Description is required.'),
  body('inv_price')
    .notEmpty().withMessage('Price is required.')
    .bail()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.')
    .toFloat(),
  body('inv_miles')
    .notEmpty().withMessage('Mileage is required.')
    .bail()
    .isInt({ min: 0 }).withMessage('Mileage must be a positive number.')
    .toInt(),
  body('inv_color')
    .trim()
    .notEmpty().withMessage('Color is required.')
    .bail()
    .isLength({ max: 20 }).withMessage('Color cannot exceed 20 characters.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.validationErrors = errors.array();
      return next();
    }
    next();
  },
];
