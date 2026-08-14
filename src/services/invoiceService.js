const Invoice = require("../models/invoiceModel");
const Booking = require("../models/bookingModel");
const Guest = require("../models/guestModel");
const Payment = require("../models/payemntModel");

const generateInvoiceNo = require(
  "../utils/generateInvoiceNo"
);

const calculateBilling = require(
  "../utils/calculateBilling"
);

// ============================================================
// CREATE INVOICE
// ============================================================

exports.createInvoice = async ({
  bookingId,
  guestId,
  items = [],
  discount = 0,
  taxPercent = 0,
  dueDate,
  notes,
  createdBy,
}) => {
  // ----------------------------------------------------------
  // Find Booking
  // ----------------------------------------------------------

  const booking =
    await Booking.findOne({
      _id: bookingId,

      isDeleted: false,
    });

  if (!booking) {
    throw new Error(
      "Booking not found"
    );
  }

  // ----------------------------------------------------------
  // Guest
  // ----------------------------------------------------------

  const finalGuestId =
    guestId ||
    booking.guestId;

  const guest =
    await Guest.findOne({
      _id: finalGuestId,

      isDeleted: false,
    });

  if (!guest) {
    throw new Error(
      "Guest not found"
    );
  }

  // ----------------------------------------------------------
  // Check Existing Invoice
  // ----------------------------------------------------------

  const existingInvoice =
    await Invoice.findOne({
      bookingId,

      isDeleted: false,

      status: {
        $ne: "cancelled",
      },
    });

  if (existingInvoice) {
    throw new Error(
      "Invoice already exists for this booking"
    );
  }

  // ----------------------------------------------------------
  // Default room item
  // ----------------------------------------------------------

  let invoiceItems =
    Array.isArray(items)
      ? items
      : [];

  if (
    invoiceItems.length === 0
  ) {
    invoiceItems = [
      {
        description:
          "Room Charges",

        quantity:
          booking.nights || 1,

        rate:
          booking.roomRate || 0,
      },
    ];
  }

  // ----------------------------------------------------------
  // Calculate
  // ----------------------------------------------------------

  const billing =
    calculateBilling({
      roomRate: 0,

      nights: 0,

      items: invoiceItems,

      discount,

      taxPercent,

      paidAmount:
        booking.paidAmount || 0,
    });

  // ----------------------------------------------------------
  // Create Invoice
  // ----------------------------------------------------------

  const invoice =
    await Invoice.create({
      invoiceNo:
        generateInvoiceNo(),

      bookingId,

      guestId:
        finalGuestId,

      items:
        billing.items,

      subtotal:
        billing.subtotal,

      discount:
        billing.discount,

      taxPercent:
        billing.taxPercent,

      taxAmount:
        billing.taxAmount,

      totalAmount:
        billing.totalAmount,

      paidAmount:
        billing.paidAmount,

      dueAmount:
        billing.dueAmount,

      status:
        billing.paymentStatus ===
        "paid"
          ? "paid"
          : billing.paymentStatus ===
            "partial"
          ? "partially_paid"
          : "issued",

      invoiceDate:
        new Date(),

      dueDate,

      notes,

      createdBy,
    });

  // ----------------------------------------------------------
  // Update Booking
  // ----------------------------------------------------------

  booking.totalAmount =
    billing.totalAmount;

  booking.paidAmount =
    billing.paidAmount;

  booking.dueAmount =
    billing.dueAmount;

  booking.paymentStatus =
    billing.paymentStatus;

  booking.updatedBy =
    createdBy;

  await booking.save();

  // ----------------------------------------------------------
  // Return populated invoice
  // ----------------------------------------------------------

  return Invoice.findById(
    invoice._id
  )
    .populate(
      "guestId",
      "guestCode name phone email"
    )
    .populate("bookingId");
};

// ============================================================
// GET ALL INVOICES
// ============================================================

exports.getInvoices = async ({
  status,
  search,
}) => {
  const filter = {
    isDeleted: false,
  };

  if (status) {
    filter.status =
      status;
  }

  if (search) {
    filter.invoiceNo = {
      $regex: search,
      $options: "i",
    };
  }

  return Invoice.find(filter)
    .populate(
      "guestId",
      "guestCode name phone email"
    )
    .populate(
      "bookingId",
      "bookingNo checkInDate checkOutDate bookingStatus"
    )
    .sort({
      createdAt: -1,
    });
};

// ============================================================
// GET INVOICE
// ============================================================

exports.getInvoiceById = async (
  invoiceId
) => {
  const invoice =
    await Invoice.findOne({
      _id: invoiceId,

      isDeleted: false,
    })
      .populate("guestId")
      .populate("bookingId");

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  const payments =
    await Payment.find({
      invoiceId:

        invoice._id,

      isDeleted: false,
    }).sort({
      paymentDate: -1,
    });

  return {
    invoice,

    payments,

    summary: {
      subtotal:
        invoice.subtotal,

      discount:
        invoice.discount,

      taxAmount:
        invoice.taxAmount,

      totalAmount:
        invoice.totalAmount,

      paidAmount:
        invoice.paidAmount,

      dueAmount:
        invoice.dueAmount,

      status:
        invoice.status,
    },
  };
};

// ============================================================
// GET INVOICES BY BOOKING
// ============================================================

exports.getInvoicesByBooking =
  async (bookingId) => {
    return Invoice.find({
      bookingId,

      isDeleted: false,
    })
      .populate(
        "guestId",
        "guestCode name phone email"
      )
      .populate("bookingId")
      .sort({
        createdAt: -1,
      });
  };

// ============================================================
// UPDATE INVOICE
// ============================================================

exports.updateInvoice = async ({
  invoiceId,
  data,
  updatedBy,
}) => {
  const invoice =
    await Invoice.findOne({
      _id: invoiceId,

      isDeleted: false,
    });

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  if (
    invoice.status ===
    "cancelled"
  ) {
    throw new Error(
      "Cancelled invoice cannot be updated"
    );
  }

  const {
    items,
    discount,
    taxPercent,
    dueDate,
    notes,
  } = data;

  // ----------------------------------------------------------
  // Recalculate
  // ----------------------------------------------------------

  if (
    items !== undefined ||
    discount !== undefined ||
    taxPercent !== undefined
  ) {
    const billing =
      calculateBilling({
        roomRate: 0,

        nights: 0,

        items:
          items !== undefined
            ? items
            : invoice.items,

        discount:
          discount !== undefined
            ? discount
            : invoice.discount,

        taxPercent:
          taxPercent !== undefined
            ? taxPercent
            : invoice.taxPercent,

        paidAmount:
          invoice.paidAmount,
      });

    invoice.items =
      billing.items;

    invoice.subtotal =
      billing.subtotal;

    invoice.discount =
      billing.discount;

    invoice.taxPercent =
      billing.taxPercent;

    invoice.taxAmount =
      billing.taxAmount;

    invoice.totalAmount =
      billing.totalAmount;

    invoice.dueAmount =
      billing.dueAmount;

    if (
      billing.paymentStatus ===
      "paid"
    ) {
      invoice.status =
        "paid";
    } else if (
      billing.paymentStatus ===
      "partial"
    ) {
      invoice.status =
        "partially_paid";
    } else {
      invoice.status =
        "issued";
    }
  }

  if (
    dueDate !== undefined
  ) {
    invoice.dueDate =
      dueDate;
  }

  if (
    notes !== undefined
  ) {
    invoice.notes =
      notes;
  }

  invoice.updatedBy =
    updatedBy;

  await invoice.save();

  // ----------------------------------------------------------
  // Update Booking
  // ----------------------------------------------------------

  const booking =
    await Booking.findById(
      invoice.bookingId
    );

  if (booking) {
    booking.totalAmount =
      invoice.totalAmount;

    booking.paidAmount =
      invoice.paidAmount;

    booking.dueAmount =
      invoice.dueAmount;

    if (
      invoice.dueAmount === 0
    ) {
      booking.paymentStatus =
        "paid";
    } else if (
      invoice.paidAmount > 0
    ) {
      booking.paymentStatus =
        "partial";
    } else {
      booking.paymentStatus =
        "unpaid";
    }

    booking.updatedBy =
      updatedBy;

    await booking.save();
  }

  return Invoice.findById(
    invoice._id
  )
    .populate("guestId")
    .populate("bookingId");
};

// ============================================================
// CANCEL INVOICE
// ============================================================

exports.cancelInvoice = async ({
  invoiceId,
  updatedBy,
}) => {
  const invoice =
    await Invoice.findOne({
      _id: invoiceId,

      isDeleted: false,
    });

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  const paymentCount =
    await Payment.countDocuments({
      invoiceId:

        invoice._id,

      isDeleted: false,

      status: "success",
    });

  if (paymentCount > 0) {
    throw new Error(
      "Invoice has payments. Reverse or refund payments first."
    );
  }

  invoice.status =
    "cancelled";

  invoice.updatedBy =
    updatedBy;

  await invoice.save();

  return invoice;
};

// ============================================================
// DELETE INVOICE
// ============================================================

exports.deleteInvoice = async ({
  invoiceId,
  updatedBy,
}) => {
  const invoice =
    await Invoice.findOneAndUpdate(
      {
        _id: invoiceId,

        isDeleted: false,
      },
      {
        isDeleted: true,

        updatedBy,
      },
      {
        new: true,
      }
    );

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  return invoice;
};