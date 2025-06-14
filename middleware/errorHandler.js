// middleware/errorHandler.js
exports.notFound = (req, res, next) => {
  res.status(404).render('errors/error', {
    title: '404 - Not Found',
    message: 'Sorry, we couldn\'t find the page you requested.',
    nav: ''
  });
};

exports.internalServerError = (err, req, res, next) => {
  res.status(500).render('errors/error', {
    title: '500 - Server Error',
    message: 'An unexpected error occurred.',
    nav: ''
  });
};