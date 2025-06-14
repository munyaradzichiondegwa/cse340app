const { body, validationResult } = require('express-validator');

const classificationValidationRules = () => {
  return [
    body('classification_name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Classification name is required.')
      .isAlphanumeric('en-US', { ignore: ' ' })
      .withMessage('Classification name must be alphanumeric.')
  ];
};

const validateClassification = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Preserve entered data and show errors
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      errors: errors.array(),
      classification_name: req.body.classification_name,
      nav: req.nav
    });
  }
  next();
};

module.exports = {
  classificationValidationRules,
  validateClassification
};
