const pool = require("../database");

/* *****************************
 * Add a new review
 * *************************** */
async function addReview(inv_id, account_id, review_text, review_rating) {
  try {
    const sql = `
      INSERT INTO review (inv_id, account_id, review_text, review_rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(sql, [inv_id, account_id, review_text, review_rating]);
    return result.rows[0];
  } catch (error) {
    console.error("addReview error:", error.message);
    return null;
  }
}

/* *****************************
 * Get reviews by inventory ID
 * *************************** */
async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.inv_id,
        r.account_id,
        r.review_text,
        r.review_rating,
        r.review_date,
        a.account_firstname,
        a.account_lastname
      FROM review AS r
      JOIN account AS a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC;
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("getReviewsByInvId error:", error.message);
    return [];
  }
}

/* *****************************
 * Get reviews by account ID
 * *************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.inv_id,
        r.account_id,
        r.review_text,
        r.review_rating,
        r.review_date,
        i.inv_make,
        i.inv_model,
        i.inv_year
      FROM review AS r
      JOIN inventory AS i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC;
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("getReviewsByAccountId error:", error.message);
    return [];
  }
}

/* *****************************
 * Update a review
 * *************************** */
async function updateReview(review_id, review_text, review_rating) {
  try {
    const sql = `
      UPDATE review
      SET review_text = $1, review_rating = $2
      WHERE review_id = $3
      RETURNING *;
    `;
    const result = await pool.query(sql, [review_text, review_rating, review_id]);
    return result.rows[0];
  } catch (error) {
    console.error("updateReview error:", error.message);
    return null;
  }
}

/* *****************************
 * Delete a review
 * *************************** */
async function deleteReview(review_id) {
  try {
    const sql = `
      DELETE FROM review
      WHERE review_id = $1;
    `;
    const result = await pool.query(sql, [review_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("deleteReview error:", error.message);
    return false;
  }
}

module.exports = {
  addReview,
  getReviewsByInvId,
  getReviewsByAccountId,
  updateReview,
  deleteReview,
};
