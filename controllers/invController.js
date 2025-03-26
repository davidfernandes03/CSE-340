const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  try {
    const data = await invModel.getInventoryById(inv_id)
    const vehicleHtml = await utilities.buildDetailView(data)
    let nav = await utilities.getNav()

    if (!data || data.length === 0) {
      next({
        status: 404,
        message: "Vehicle not found"
      })
      return
    }

    res.render("./inventory/detail", {
      title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
      nav,
      vehicleHtml,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Render the management page
 **************************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: "Testing Page",
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Intentionally Trigger a 500 Error
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  try {
    throw new Error("This is a forced error to test the error handling middleware.");
  } catch (error) {
    next(error);
  }
}

module.exports = invCont