const invModel = require("../models/inventory-model");

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
 * Build the classification view HTML
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
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build Vehicle Detail HTML
 * Takes vehicle object and returns HTML string
 ************************************** */
Util.buildVehicleDetailHTML = function (data) {
  if (!data) return '<p>Vehicle not found</p>';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  });

  return `
    <div class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${data.inv_image}" 
             alt="${data.inv_year} ${data.inv_make} ${data.inv_model}">
      </div>
      <div class="vehicle-info">
        <h1>${data.inv_year} ${data.inv_make} ${data.inv_model}</h1>

        <div class="price-section">
          <span class="price-label">No-Haggle Price</span>
          <div class="price">${formatter.format(data.inv_price)}</div>
        </div>

        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">Mileage:</span>
            <span class="spec-value">${data.inv_miles.toLocaleString()} miles</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Color:</span>
            <span class="spec-value">${data.inv_color}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Classification:</span>
            <span class="spec-value">${data.classification_name}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Stock #:</span>
            <span class="spec-value">${data.inv_id}</span>
          </div>
        </div>

        <div class="description">
          <h3>Vehicle Description</h3>
          <p>${data.inv_description}</p>
        </div>

        <div class="action-buttons">
          <a href="#" class="btn btn-primary">START MY PURCHASE</a>
          <a href="#" class="btn btn-secondary">ESTIMATE PAYMENTS</a>
          <a href="#" class="btn btn-outline">CONTACT US</a>
          <a href="#" class="btn btn-outline">SCHEDULE TEST DRIVE</a>
          <a href="#" class="btn btn-outline">APPLY FOR FINANCING</a>
        </div>
      </div>
    </div>
  `;
};

module.exports = Util;
