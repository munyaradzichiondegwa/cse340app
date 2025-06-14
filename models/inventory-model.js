const pool = require("../database/");

/* Get all classifications */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* Get inventory by classification id */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i 
       JOIN public.classification AS c ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: ", error);
    return [];
  }
}

/* Get inventory (vehicle) by inventory id */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i 
       JOIN public.classification AS c ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error: ", error);
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
};
