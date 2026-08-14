const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    rate: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },

    items: [invoiceItemSchema],

    subtotal: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    taxPercent: {
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

    status: {
      type: String,
      enum: [
        "draft",
        "issued",
        "partially_paid",
        "paid",
        "cancelled",
      ],
      default: "draft",
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
    },

    notes: {
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

module.exports = mongoose.model("Invoice", invoiceSchema);