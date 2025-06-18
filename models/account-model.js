// --- Required Dependencies ---
// Database connection pool.
const pool = require('../database/index');

/* ========================================
 * Register new account
 * Inserts a new account record into the database.
 * ===================================== */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

/* ========================================
 * Check for an existing email address
 * Used for registration validation to prevent duplicate accounts.
 * ===================================== */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rows[0];
  } catch (error) {
    return error.message;
  }
}

/* ========================================
 * Return account data using email address
 * Used for the login process to fetch account details for password verification.
 * ===================================== */
// *** FIX: Re-added the getAccountByEmail function for the login process. ***
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

// --- Export Model Functions ---
// Makes all functions available for use in the controllers.
module.exports = {
  registerAccount,
  checkExistingEmail,
  // *** FIX: Exported both functions. ***
  getAccountByEmail 
};