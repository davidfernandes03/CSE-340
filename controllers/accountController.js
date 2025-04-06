// Needed Resources 
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()

  const message = req.session.message;
  delete req.session.message; 

  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body;


  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered as "${account_firstname}". Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      message: req.flash("notice")
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      message: req.flash("notice")
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      message: "Please check your credentials and try again.",
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        message: "Please check your credentials and try again.",
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Build Account Management View
 * ************************************ */
async function buildAccountManagementView(req, res, next) {
  let nav = await utilities.getNav()

  const message = req.session.message;
  delete req.session.message; 

  try {
    res.render("account/index", {
      title: "Account Management",
      nav,
      errors: null,
      message
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Account Logout
 * ************************************ */
async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt")
    req.session.message = "You have successfully logged out."

    return res.redirect("/account/login")
  } catch (error) {
    next(error)

    req.session.message = "An error occurred while logging out."
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Build Update Account View
 * ************************************ */
async function buildUpdateAccountView(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = req.params.account_id
    const accountData = await accountModel.getAccountById(account_id)

    const message = req.session.message;
    delete req.session.message;

    if (!accountData) {
      req.session.message = "Account not found."
      return res.redirect("/account")
    }
    
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      message,
      errors: null,
      account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Update Account
 * ************************************ */
async function updateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const accountData = await accountModel.getAccountById(account_id)

    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render("account/update", {
        errors,
        title: "Update Account",
        nav,
        message: "Please correct the errors below.",
        accountData: req.body,
      });
    }

    const existingAccount = await accountModel.getAccountByEmail(account_email)
    if (existingAccount && existingAccount.account_id != account_id) {
      req.session.message = "This email is already in use."
      return res.redirect(`/account/update/${account_id}`)
    }

    const result = await accountModel.updateAccountModel(account_id, account_firstname, account_lastname, account_email)

    if (result) {
      const updatedAccount = {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        account_type: accountData.account_type
      }

      const newToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", newToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", newToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      req.session.account = updatedAccount
      res.locals.accountData = updatedAccount

      req.session.message = "Account updated successfully."

      return res.redirect("/account")
    } else {
      return res.render("account/update", {
        errors,
        title: "Update Account",
        nav,
        message: "Error updating account.",
        account_firstname,
        account_lastname,
        account_email,
        account_id,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Update Password
 * ************************************ */
async function updatePassword(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { password, confirmPassword, account_id } = req.body;
    const accountData = await accountModel.getAccountById(account_id)
    
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render("account/update", {
        errors,
        title: "Update Account",
        nav,
        message: "Please correct the errors below.",
        account_id,
      });
    }

    if (password !== confirmPassword) {
      req.session.message = "Passwords do not match.";
      return res.redirect("/account/update/" + account_id);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await accountModel.updatePasswordModel(account_id, hashedPassword);

    if (result) {
      const updatedAccountData = await accountModel.getAccountById(account_id);

      const updatedAccount = {
        account_id: updatedAccountData.account_id,
        account_firstname: updatedAccountData.account_firstname,
        account_lastname: updatedAccountData.account_lastname,
        account_email: updatedAccountData.account_email,
        account_type: updatedAccountData.account_type
      };

      const newToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", newToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", newToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }

      req.session.account = updatedAccount;
      res.locals.accountData = updatedAccount;

      req.session.message = "Password updated successfully.";
      return res.redirect("/account/");

    } else {
      req.session.message = "Error updating password.";
      return res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    next(error);
  }
}

/* *****************************
* Final Enhancement -> Get account data with type
* ***************************** */
async function accountFilter(req, res, next) {
  try {
    const account_type = req.params.account_type
    const result = await accountModel.getAccountsByType(account_type)
    return res.json(result.rows)
  } catch (error) {
    next(error)
  }
}

// Exporting functions
module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagementView, accountLogout, buildUpdateAccountView, updateAccount, updatePassword, accountFilter }