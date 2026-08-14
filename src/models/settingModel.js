const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    // ============================================================
    // HOTEL INFORMATION
    // ============================================================

    hotelName: {
      type: String,
      required: true,
      trim: true,
    },

    hotelCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    hotelType: {
      type: String,
      enum: [
        "hotel",
        "resort",
        "lodge",
        "guest_house",
        "hostel",
        "homestay",
        "other",
      ],
      default: "hotel",
    },

    description: {
      type: String,
      trim: true,
    },

    // ============================================================
    // CONTACT INFORMATION
    // ============================================================

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    // ============================================================
    // ADDRESS
    // ============================================================

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    pincode: {
      type: String,
      trim: true,
    },

    // ============================================================
    // TAX / BILLING
    // ============================================================

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    taxEnabled: {
      type: Boolean,
      default: true,
    },

    defaultTaxPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 12,
    },

    serviceChargeEnabled: {
      type: Boolean,
      default: false,
    },

    serviceChargePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ============================================================
    // CURRENCY
    // ============================================================

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR",
    },

    currencySymbol: {
      type: String,
      trim: true,
      default: "₹",
    },

    decimalPlaces: {
      type: Number,
      min: 0,
      max: 4,
      default: 2,
    },

    // ============================================================
    // BOOKING SETTINGS
    // ============================================================

    checkInTime: {
      type: String,
      default: "12:00",
      trim: true,
    },

    checkOutTime: {
      type: String,
      default: "11:00",
      trim: true,
    },

    earlyCheckInAllowed: {
      type: Boolean,
      default: true,
    },

    lateCheckOutAllowed: {
      type: Boolean,
      default: true,
    },

    allowOnlineBooking: {
      type: Boolean,
      default: true,
    },

    allowPartialPayment: {
      type: Boolean,
      default: true,
    },

    requireGuestId: {
      type: Boolean,
      default: false,
    },

    requireGuestPhone: {
      type: Boolean,
      default: true,
    },

    // ============================================================
    // CANCELLATION SETTINGS
    // ============================================================

    cancellationAllowed: {
      type: Boolean,
      default: true,
    },

    cancellationHours: {
      type: Number,
      min: 0,
      default: 24,
    },

    cancellationChargePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ============================================================
    // INVOICE SETTINGS
    // ============================================================

    invoicePrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INV",
    },

    bookingPrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "BK",
    },

    paymentPrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "PAY",
    },

    invoiceFooter: {
      type: String,
      trim: true,
      default: "Thank you for staying with us.",
    },

    termsAndConditions: {
      type: String,
      trim: true,
    },

    // ============================================================
    // HOUSEKEEPING
    // ============================================================

    housekeepingEnabled: {
      type: Boolean,
      default: true,
    },

    autoCreateCheckoutCleaning: {
      type: Boolean,
      default: true,
    },

    // ============================================================
    // NOTIFICATION SETTINGS
    // ============================================================

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    bookingConfirmationEmail: {
      type: Boolean,
      default: true,
    },

    paymentConfirmationEmail: {
      type: Boolean,
      default: true,
    },

    checkoutEmail: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // SYSTEM
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Setting",
  settingSchema
);