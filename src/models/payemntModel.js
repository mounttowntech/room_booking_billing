const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentNo: {
      type: String,
      required: true,
      unique: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "upi",
        "card",
        "bank_transfer",
        "wallet",
        "other",
      ],
      required: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "success",
        "pending",
        "failed",
        "refunded",
      ],
      default: "success",
    },

    remarks: {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);