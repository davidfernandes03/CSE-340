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

module.exports = router;