const pool = require('../database');

/* Get all classifications */
async function getClassifications() {
    const result = await pool.query(
        "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return result.rows;
}

/* Get inventory by classification id */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT i.*, c.classification_name
             FROM public.inventory AS i
             JOIN public.classification AS c
               ON i.classification_id = c.classification_id
             WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByClassificationId error:", error);
        return [];
    }
}

/* Get vehicle by inventory id */
async function getVehicleById(inv_id) {
    try {
        const sql = `SELECT i.*, c.classification_name
                     FROM public.inventory i
                     JOIN public.classification c ON i.classification_id = c.classification_id
                     WHERE i.inv_id = $1`;
        const result = await pool.query(sql, [inv_id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('getVehicleById error:', error);
        return null;
    }
}

/* Add new classification */
async function addClassification(name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id";
        const result = await pool.query(sql, [name]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("addClassification error:", error);
        return null;
    }
}

/* Add new inventory item */
async function addInventory(item) {
    try {
        const sql = `
            INSERT INTO public.inventory (
                inv_make,
                inv_model,
                inv_year,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_miles,
                inv_color,
                classification_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *;
        `;
        const values = [
            item.inv_make,
            item.inv_model,
            item.inv_year,
            item.inv_description,
            item.inv_image,
            item.inv_thumbnail,
            item.inv_price,
            item.inv_miles,
            item.inv_color,
            item.classification_id,
        ];
        const result = await pool.query(sql, values);
        return result.rows[0];
    } catch (error) {
        console.error("addInventory error:", error);
        return null;
    }
}

/* ***************************
 *  Update Inventory Data
 ************************** */
async function updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        const sql = `
            UPDATE public.inventory
            SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4,
                inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9,
                classification_id = $10
            WHERE inv_id = $11 RETURNING *;
        `;
        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
            inv_id
        ]);
        return data.rows[0];
    } catch (error) {
        console.error("model error: " + error);
    }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
    try {
        const sql = 'DELETE FROM inventory WHERE inv_id = $1';
        const data = await pool.query(sql, [inv_id]);
        return data; // Returns query result which includes rowCount
    } catch (error) {
        console.error("Delete Inventory Error:", error); // Added error logging
        throw new Error("Delete Inventory Error"); // Re-throw for controller to catch
    }
}


module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getVehicleById,
    addClassification,
    addInventory,
    updateInventory,
    deleteInventoryItem, // Exported here
};