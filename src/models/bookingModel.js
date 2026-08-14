const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    adults: {
      type: Number,
      default: 1,
      min: 1,
    },

    children: {
      type: Number,
      default: 0,
    },

    nights: {
      type: Number,
      default: 1,
    },

    roomRate: {
      type: Number,
      required: true,
      min: 0,
    },

    roomAmount: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "partial",
        "paid",
        "refunded",
      ],
      default: "unpaid",
    },

    source: {
      type: String,
      enum: [
        "walk_in",
        "phone",
        "website",
        "online",
        "other",
      ],
      default: "walk_in",
    },

    specialRequest: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    cancelledAt: {
      type: Date,
    },

    cancellationReason: {
      type: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Booking", bookingSchema);