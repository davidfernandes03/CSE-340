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

/* ****************************************
 * Render the Add Classification Page
 **************************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: "Add a new classification for the navigation bar!",
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process New Classification Submission
 **************************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { classification_name } = req.body

    // Server-side validation
    if (!/^[a-zA-Z0-9]+$/.test(classification_name)) {
      req.flash("notice", "Invalid classification name. No spaces or special characters allowed.")
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: req.flash("notice"),
      })
    }

    const insertResult = await invModel.addClassification(classification_name)

    if (insertResult) {
      req.flash("notice", "New classification added successfully!");
      let nav = await utilities.getNav();

      return res.render("inventory/add-classification", {
          title: "Add New Classification",
          nav,
          message: req.flash("notice"),
        })
    } else {
      req.flash("notice", "Error adding classification. Please try again.")
      let nav = await utilities.getNav();
      
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: req.flash("notice"),
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Render the Add Vehicle Page
 **************************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      message: "Insert the new vehicle informations!",
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process New Classification Submission
 **************************************** */
invCont.addInventoryItem = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList()
    const { 
      inv_make, inv_model, inv_year, inv_description, 
      inv_image, inv_thumbnail, inv_price, inv_miles, 
      inv_color, classification_id 
    } = req.body

    if (!inv_make || !inv_model || !inv_year || !inv_description || !inv_image || !inv_thumbnail || !inv_price || !inv_miles ||
    !inv_color || !classification_id) {
      req.flash("notice", "⚠️ All fields are required. Don't try to play the smart!");
      return res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classificationSelect,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        message: req.flash("notice"),
      });
    }

    const insertResult = await invModel.addInventoryItem(req.body)

    if (insertResult) {
      req.flash("notice", "New vehicle added successfully!")
      let nav = await utilities.getNav();

      return res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classificationSelect,
        message: req.flash("notice"),
      })
    } else {
      req.flash("notice", "Error adding vehicle. Please try again.");
      let nav = await utilities.getNav();
      
      return res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classificationSelect,
        message: req.flash("notice"),
      });
    }
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