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
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
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
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
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

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
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
  })
}

/* ****************************************
 * Update Inventory Data
 **************************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
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
  } = req.body
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      message: req.flash("notice"),
    })
    res.redirect("/inv")
    
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    message: req.flash("notice"),
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
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.confirmDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()

    const itemData = await invModel.getInventoryById(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Delete Inventory Data
 **************************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)

  const itemData = await invModel.getInventoryById(inv_id)
  if (!itemData) {
    return res.redirect("/inv/")
  }
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      message: `The ${itemName} was successfully deleted.`,
    })
    res.redirect("/inv")
    
  } else {
    req.flash("notice", "The deletion failed. Please try again.")
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  }
}

module.exports = invCont