const utilities = require('../utilities');

exports.notFound = async (req, res, next) => {
  const nav = await utilities.getNav();
  res.status(404).render('errors/error', {
    title: '404 - Not Found',
    message: "Sorry, we couldn't find the page you requested.",
    nav,
  });
};

exports.internalServerError = async (err, req, res, next) => {
  console.error(err.stack);  // Log the error stack to console for debugging

  const nav = await utilities.getNav();
  res.status(500).render('errors/error', {
    title: '500 - Server Error',
    message: 'An unexpected error occurred.',
    nav,
  });
};
