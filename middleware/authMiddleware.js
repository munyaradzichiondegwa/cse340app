const jwt = require('jsonwebtoken');
require('dotenv').config();

function checkLogin(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash('notice', 'Please log in to continue.');
    return res.redirect('/account/login');
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.accountData = payload;
    next();
  } catch {
    req.flash('notice', 'Session expired, please log in again.');
    return res.redirect('/account/login');
  }
}

function checkAdmin(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash('notice', 'Please log in to access this page.');
    return res.redirect('/account/login');
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.accountData = payload;

    if (payload.account_type === 'Employee' || payload.account_type === 'Admin') {
      return next();
    } else {
      req.flash('notice', 'You do not have permission to access this page.');
      return res.redirect('/account/login');
    }
  } catch {
    req.flash('notice', 'Session expired, please log in again.');
    return res.redirect('/account/login');
  }
}

module.exports = { checkLogin, checkAdmin };
