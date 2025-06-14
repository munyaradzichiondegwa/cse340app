const pool = require('../database'); // Adjust if your pool connection file is named differently

/**
 * Get all classifications sorted by name
 * @returns {Promise<Array>} Array of classification objects
 */
async function getClassifications() {
  try {
    const sql = `SELECT * FROM public.classification ORDER BY classification_name`;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    throw new Error('Error fetching classifications: ' + error.message);
  }
}

/**
 * Add a new classification
 * @param {string} classification_name - The name of the classification to add
 * @returns {Promise<boolean>} true if insert succeeded
 */
async function addClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id`;
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount > 0;
  } catch (error) {
    throw new Error('Error adding classification: ' + error.message);
  }
}

/**
 * Get classification by ID
 * @param {number} classification_id
 * @returns {Promise<Object|null>} Classification object or null if not found
 */
async function getClassificationById(classification_id) {
  try {
    const sql = `SELECT * FROM public.classification WHERE classification_id = $1`;
    const result = await pool.query(sql, [classification_id]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error('Error fetching classification by ID: ' + error.message);
  }
}

module.exports = {
  getClassifications,
  addClassification,
  getClassificationById,
};
