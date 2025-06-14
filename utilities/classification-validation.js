const { body, validationResult } = require('express-validator');

/**
 * Validation rules for classification form
 */
const classificationValidationRules = () => {
  return [
    body('classification_name')
      .trim()
      .notEmpty()
      .withMessage('Classification name is required.')
      .isAlphanumeric('en-US', { ignore: ' ' })
      .withMessage('Classification name must be alphanumeric.')
  ];
};

/**
 * Middleware to check validation results for classification form
 */
const validateClassification = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav: req.nav || '', // fallback in case nav isn't passed
      errors: errors.array(),
      classification_name: req.body.classification_name || ''
    });
  }
  next();
};

module.exports = {
  classificationValidationRules,
  validateClassification
};
