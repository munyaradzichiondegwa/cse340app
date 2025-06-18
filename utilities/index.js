// --- Required Dependencies ---
const invModel = require("../models/inventory-model");
// For creating and verifying JSON Web Tokens.
const jwt = require("jsonwebtoken");
// To load environment variables from a .env file.
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification grid HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid = '';
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li>';
      grid +=
        '<a href="../../inv/detail/' + vehicle.inv_id +
        '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details"><img src="' + vehicle.inv_thumbnail +
        '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +
        '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' +
        vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ****************************************
 * Build Vehicle Detail HTML
 * This function creates the HTML for the vehicle detail view.
 **************************************** */
Util.buildVehicleDetailHTML = function (vehicle) {
  // Format price and mileage as required
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(vehicle.inv_price);

  const formattedMiles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

  // Build the HTML string
  let html = `
    <div class="detail-layout">
      <div class="detail-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="detail-info">
        <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
        <div class="detail-price">
          <strong>Price:</strong> ${formattedPrice}
        </div>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Mileage:</strong> ${formattedMiles}</p>
      </div>
    </div>
  `;
  return html;
};

/* ****************************************
* Middleware For Handling Errors
**************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check JWT token validity
 * This function verifies if a JSON Web Token exists in the request cookies.
 * On success, it populates res.locals with user data.
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login - Authorization Middleware
 *  This function checks if a user is logged in before granting access to a route.
 * ************************************ */
// *** NEW FUNCTION ADDED HERE ***
Util.checkLogin = (req, res, next) => {
  // 1. Check the 'loggedin' flag in res.locals. This is set by the checkJWTToken middleware.
  if (res.locals.loggedin) {
    // 2. If the user is logged in, pass control to the next middleware or route handler.
    next();
  } else {
    // 3. If the user is not logged in, create a flash message...
    req.flash("notice", "Please log in.");
    // 4. ...and redirect them to the login page.
    return res.redirect("/account/login");
  }
};

// --- Export Utility Functions ---
module.exports = Util;