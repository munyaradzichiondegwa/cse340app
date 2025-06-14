const invModel = require('../models/inventory-model');

/**
 * Builds a dynamic classification <select> dropdown
 * @param {number} selectedId - The classification_id to pre-select (optional)
 * @returns {string} - HTML string for the classification dropdown
 */
async function buildClassificationList(selectedId = 0) {
  try {
    const data = await invModel.getClassifications();
    let list = '<select name="classification_id" id="classificationList" required>';
    list += '<option value="" disabled' + (!selectedId ? ' selected' : '') + '>Select Classification</option>';

    data.rows.forEach(classification => {
      const selected = classification.classification_id === Number(selectedId) ? ' selected' : '';
      list += `<option value="${classification.classification_id}"${selected}>${classification.classification_name}</option>`;
    });

    list += '</select>';
    return list;
  } catch (error) {
    console.error("Error building classification list:", error);
    return '<select name="classification_id" id="classificationList" required><option value="">No classifications available</option></select>';
  }
}

module.exports = {
  // other utility exports here
  buildClassificationList
};
