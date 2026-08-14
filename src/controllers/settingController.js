const Setting = require("../models/settingModel");

// ============================================================
// CREATE SETTINGS
// POST /api/settings
// ============================================================

exports.createSettings = async (req, res) => {
  try {
    // ----------------------------------------------------------
    // Check if settings already exist
    // ----------------------------------------------------------

    const existingSettings = await Setting.findOne({
      isActive: true,
    });

    if (existingSettings) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist. Please update them.",
      });
    }

    // ----------------------------------------------------------
    // Create settings
    // ----------------------------------------------------------

    const settings = await Setting.create({
      ...req.body,

      createdBy:
        req.user?._id ||
        req.user?.id ||
        null,

      updatedBy:
        req.user?._id ||
        req.user?.id ||
        null,
    });

    res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: settings,
    });
  } catch (error) {
    console.error(
      "Create Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// GET SETTINGS
// GET /api/settings
// ============================================================

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne({
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error(
      "Get Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// UPDATE SETTINGS
// PUT /api/settings
// ============================================================

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne({
      isActive: true,
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    // ----------------------------------------------------------
    // Fields that are allowed to update
    // ----------------------------------------------------------

    const allowedFields = [
      "hotelName",
      "hotelCode",
      "hotelType",
      "description",

      "email",
      "phone",
      "alternatePhone",
      "website",

      "address",
      "city",
      "state",
      "country",
      "pincode",

      "gstNumber",
      "taxEnabled",
      "defaultTaxPercent",
      "serviceChargeEnabled",
      "serviceChargePercent",

      "currency",
      "currencySymbol",
      "decimalPlaces",

      "checkInTime",
      "checkOutTime",
      "earlyCheckInAllowed",
      "lateCheckOutAllowed",
      "allowOnlineBooking",
      "allowPartialPayment",
      "requireGuestId",
      "requireGuestPhone",

      "cancellationAllowed",
      "cancellationHours",
      "cancellationChargePercent",

      "invoicePrefix",
      "bookingPrefix",
      "paymentPrefix",
      "invoiceFooter",
      "termsAndConditions",

      "housekeepingEnabled",
      "autoCreateCheckoutCleaning",

      "emailNotifications",
      "bookingConfirmationEmail",
      "paymentConfirmationEmail",
      "checkoutEmail",
    ];

    // ----------------------------------------------------------
    // Update only allowed fields
    // ----------------------------------------------------------

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    settings.updatedBy =
      req.user?._id ||
      req.user?.id ||
      settings.updatedBy;

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error(
      "Update Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// UPDATE ACTIVE STATUS
// PUT /api/settings/status
// ============================================================

exports.updateSettingsStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const settings = await Setting.findOne({
      isActive: true,
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    settings.isActive = isActive;

    settings.updatedBy =
      req.user?._id ||
      req.user?.id ||
      settings.updatedBy;

    await settings.save();

    res.status(200).json({
      success: true,
      message: `Settings ${
        isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      data: settings,
    });
  } catch (error) {
    console.error(
      "Update Settings Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// DELETE SETTINGS
// DELETE /api/settings
// ============================================================

exports.deleteSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne({
      isActive: true,
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    settings.isActive = false;

    settings.updatedBy =
      req.user?._id ||
      req.user?.id ||
      settings.updatedBy;

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Settings Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};