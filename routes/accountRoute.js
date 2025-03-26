// Needed Resources 
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const validation = require('../utilities/account-validation');

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
    "/register",
    validation.registrationRules(),
    validation.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
    "/login",
    validation.loginRules(),
    validation.checkLogData,
    utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;