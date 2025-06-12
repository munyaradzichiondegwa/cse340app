// middleware/errorHandler.js

function handleErrors(fn) {
    return function (req, res, next) {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
  
  function notFound(req, res, next) {
    res.status(404).render("errors/404", {
      title: "Page Not Found",
      message: "Sorry, we can't find that page.",
    })
  }
  
  function internalServerError(err, req, res, next) {
    console.error(err.stack)
    res.status(500).render("errors/500", {
      title: "Server Error",
      message: "Something went wrong on our end.",
    })
  }
  
  module.exports = {
    handleErrors,
    notFound,
    internalServerError,
  }
  