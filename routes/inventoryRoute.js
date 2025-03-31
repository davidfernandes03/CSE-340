// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));

// Intentional error route
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

// Route for management page
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Route to display the Add Classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView));

// Route to process the form submission
router.post("/add-classification", utilities.handleErrors(invController.addClassification));

// Route to display the Add Vehicle form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventoryView));

// Route to process a new addition
router.post("/add-inventory", utilities.checkInventoryData, utilities.handleErrors(invController.addInventoryItem));

// Inventory Management route
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to display the edit inventory view
router.get("/edit/:inventory_id", utilities.handleErrors(invController.editInventoryView));

// Route to handle inventory update
router.post(
    "/update",
    utilities.checkUpdateData,
    utilities.handleErrors(invController.updateInventory));

module.exports = router;