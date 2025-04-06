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
    utilities.handleErrors(accountController.accountLogin)
);

// 🔒 Account management view route
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagementView))

// Logout process
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

// 🔒 Account update route
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccountView))

// 🔒 Process the account update
router.post(
    "/update/:account_id",
    utilities.checkLogin,
    validation.updateAccountRules(),
    utilities.handleErrors(accountController.updateAccount)
);

// 🔒 Process the password change
router.post(
    "/update-password",
    utilities.checkLogin,
    validation.updatePasswordRules(),
    utilities.handleErrors(accountController.updatePassword)
);

// 🔒 Final Enhancement -> Accounts filter route
router.get("/getAccounts/:account_type", utilities.checkLogin, accountController.accountFilter)

module.exports = router;