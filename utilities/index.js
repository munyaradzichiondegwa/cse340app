const invModel = require("../models/inventory-model");
const pool = require("../database"); // For direct SQL queries
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/**
 * Constructs the nav HTML unordered list
 * Only shows classifications that have vehicles
 * Excludes 'New Car' classification (case-insensitive)
 * @returns {Promise<string>} HTML string for navigation
 */
Util.getNav = async function () {
  try {
    const sql = `
      SELECT DISTINCT c.classification_id, c.classification_name
      FROM classification c
      JOIN inventory i ON c.classification_id = i.classification_id
      WHERE LOWER(c.classification_name) != 'new car'
      ORDER BY c.classification_name
    `;
    const result = await pool.query(sql);
    const data = result.rows;

    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.forEach((row) => {
      list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error in getNav:", error.message);
    // Fallback nav in case of database error
    return '<ul><li><a href="/" title="Home page">Home</a></li></ul>';
  }
};

/**
 * Build the classification select list HTML
 * @param {number|null} selected Optional selected classification_id
 * @returns {Promise<string>} HTML string for select list
 */
Util.buildClassificationList = async function (selected = null) {
  const data = await invModel.getClassifications();
  let list = '<select name="classification_id" id="classification_id" required>';
  list += '<option value="">Choose a Classification</option>';
  data.forEach((row) => {
    list += `<option value="${row.classification_id}"`;
    if (selected && row.classification_id == selected) {
      list += " selected";
    }
    list += `>${row.classification_name}</option>`;
  });
  list += '</select>';
  return list;
};

/**
 * Build the classification grid HTML
 * @param {Array} data Array of vehicle objects
 * @returns {string} HTML string for vehicle grid
 */
Util.buildClassificationGrid = async function (data) {
  let grid = '';
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li>';
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a>`;
      grid += '</h2>';
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/**
 * Build Vehicle Detail HTML
 * @param {Object} vehicle Vehicle object
 * @returns {string} HTML string for vehicle details
 */
Util.buildVehicleDetailHTML = function (vehicle) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(vehicle.inv_price);

  const formattedMiles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}" />
      </div>
      <div class="vehicle-info">
        <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <h2>Year: ${vehicle.inv_year}</h2>
        <h3>Price: ${formattedPrice}</h3>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Mileage:</strong> ${formattedMiles} miles</p>
      </div>
    </div>
  `;
};

/**
 * Middleware for handling async errors
 * @param {Function} fn Async route handler
 * @returns {Function} Express middleware
 */
Util.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("Async error caught in middleware:", err);
    next(err);
  });
};

/**
 * Middleware to check JWT token validity from cookie
 * Attaches accountData to req and res.locals if valid
 */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          res.locals.accountData = undefined; // Ensure accountData is undefined on error
          res.locals.loggedin = 0; // Ensure loggedin is 0 on error
          return res.redirect("/account/login");
        }
        req.accountData = accountData;           // Attach to request for controller/middleware access
        res.locals.accountData = accountData;    // Attach to locals for views
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    res.locals.accountData = undefined; // Ensure accountData is undefined if no JWT
    res.locals.loggedin = 0; // Ensure loggedin is 0 if no JWT
    next();
  }
};

/**
 * Middleware to check if user is logged in
 * Redirects to login if not authenticated
 */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/**
 * Middleware to check if logged-in user is Admin or Employee
 * Redirects to login with message if unauthorized
 */
Util.checkAuthorization = (req, res, next) => {
  const accountType = res.locals.accountData?.account_type;
  if (res.locals.loggedin && (accountType === 'Employee' || accountType === 'Admin')) {
    next();
  } else {
    req.flash("notice", "You do not have permission to access this page.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;