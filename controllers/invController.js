const classificationModel = require("../models/classification-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const NO_IMAGE = "/images/vehicles/no-image.png";
const NO_THUMBNAIL = "/images/vehicles/no-image-tn.png";

const inventoryController = {};

/* ***************************
 * Build inventory by classification view
 ************************** */
inventoryController.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classification_id;
    console.log("Requested classification_id:", classification_id);

    try {
        const vehicles = await invModel.getInventoryByClassificationId(classification_id);
        console.log("Vehicles found:", vehicles.length);

        const classificationsData = await classificationModel.getClassifications();
        const classification = classificationsData.find(c => c.classification_id == classification_id);
        const className = classification ? classification.classification_name : "Vehicles";

        const grid = await utilities.buildClassificationGrid(vehicles);
        const nav = await utilities.getNav();

        res.render("./inventory/classification", {
            title: vehicles.length > 0 ? className + " vehicles" : "No vehicles found for this classification",
            nav,
            grid,
        });
    } catch (error) {
        console.error("Error in buildByClassificationId:", error);
        next(error);
    }
};

/* ***************************
 * Show vehicle detail view
 ************************** */
inventoryController.showVehicleDetail = async (req, res, next) => {
    const invId = req.params.invId;
    try {
        const vehicle = await invModel.getVehicleById(invId);

        if (!vehicle) {
            return res.status(404).render('errors/404', {
                title: "Vehicle Not Found",
                message: "Sorry, we could not find that vehicle."
            });
        }

        const vehicleHTML = utilities.buildVehicleDetailHTML(vehicle);
        const nav = await utilities.getNav();

        res.render('inventory/detail', {
            title: `${vehicle.inv_make} ${vehicle.inv_model}`,
            nav,
            grid: vehicleHTML,
        });
    } catch (error) {
        console.error("Error in showVehicleDetail:", error);
        next(error);
    }
};

/* ***************************
 * Inventory Management View
 ************************** */
inventoryController.buildManagement = async (req, res, next) => {
    try {
        const nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationList();

        res.render("inventory/management", {
            title: "Inventory Management",
            nav,
            message: req.flash("message"),
            classificationSelect,
        });
    } catch (error) {
        next(error);
    }
};

/* ***************************
 * Display Add Classification Form
 ************************** */
inventoryController.buildAddClassification = async (req, res, next) => {
    try {
        const nav = await utilities.getNav();
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ***************************
 * Handle Add Classification Submission
 ************************** */
inventoryController.addClassification = async (req, res, next) => {
    try {
        let { classification_name } = req.body;
        classification_name = classification_name.trim();

        const result = await invModel.addClassification(classification_name);
        const nav = await utilities.getNav();

        if (result) {
            req.flash("message", "Classification added successfully.");
            return res.redirect("/inv/management"); // Corrected to redirect
        } else {
            res.render("inventory/add-classification", {
                title: "Add Classification",
                nav,
                errors: [{ msg: "Classification could not be added." }],
            });
        }
    } catch (error) {
        next(error);
    }
};

/* ***************************
 * Display Add Inventory Form
 ************************** */
inventoryController.buildAddInventory = async function (req, res, next) {
    try {
        const classificationId = req.body?.classification_id || 0;
        const nav = await utilities.getNav();
        const classificationList = await utilities.buildClassificationList(classificationId);

        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            errors: null,
            message: req.flash("message"),
            inv_make: "",
            inv_model: "",
            inv_year: "",
            inv_description: "",
            inv_image: NO_IMAGE,
            inv_thumbnail: NO_THUMBNAIL,
            inv_price: "",
            inv_miles: "",
            inv_color: "",
        });
    } catch (error) {
        next(error);
    }
};

/* ***************************
 * Handle Add Inventory Submission
 ************************** */
inventoryController.addInventory = async (req, res, next) => {
    try {
        let {
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        } = req.body;

        if (!inv_image || inv_image.trim() === "") inv_image = NO_IMAGE;
        if (!inv_thumbnail || inv_thumbnail.trim() === "") inv_thumbnail = NO_THUMBNAIL;

        const result = await invModel.addInventory({
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        });

        if (result) {
            req.flash("message", `${inv_make} ${inv_model} added successfully.`);
            return res.redirect("/inv/management");
        }

        const nav = await utilities.getNav();
        const classificationList = await utilities.buildClassificationList(classification_id);
        res.status(500).render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            errors: [{ msg: "Failed to add vehicle. Please try again." }],
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        });
    } catch (error) {
        console.error("Error in addInventory:", error);
        const nav = await utilities.getNav();
        const classificationList = await utilities.buildClassificationList(req.body.classification_id);
        res.status(500).render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            errors: [{ msg: "Database error: " + error.message }],
            ...req.body,
        });
    }
};

/* ***************************
 *  Build edit inventory view
 ************************** */
inventoryController.buildEditInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationList,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
    });
};

/* ***************************
 * Update Inventory Data
 ************************** */
inventoryController.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
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
        classification_id,
    } = req.body;

    const updateResult = await invModel.updateInventory(
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
    );

    if (updateResult) {
        const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
        req.flash("notice", `The ${itemName} was successfully updated.`);
        res.redirect("/inv/");
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("notice", "Sorry, the update failed.");
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
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
        });
    }
};

/* ***************************
 *  Build delete confirmation view
 * ************************** */
inventoryController.buildDeleteConfirmationView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
    });
};

/* ***************************
 *  Process the delete request
 * ************************** */
inventoryController.deleteInventoryItem = async function (req, res, next) {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult.rowCount) {
        req.flash("notice", `The vehicle was successfully deleted.`);
        res.redirect("/inv/");
    } else {
        req.flash("notice", "Sorry, the delete failed.");
        res.redirect(`/inv/delete/${inv_id}`);
    }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 ************************** */
inventoryController.getInventoryJSON = async (req, res, next) => {
    try {
        const classification_id = parseInt(req.params.classification_id);
        const invData = await invModel.getInventoryByClassificationId(classification_id);

        if (invData && invData.length > 0 && invData[0].inv_id) {
            return res.json(invData);
        } else {
            return res.json([]); // Return empty array if no data or invalid data
        }
    } catch (error) {
        console.error("Error in getInventoryJSON:", error);
        next(error); // Pass error to global error handler
    }
};

module.exports = inventoryController;