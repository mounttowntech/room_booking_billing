const Payment = require("../models/payemntModel");
const Invoice = require("../models/invoiceModel");
const Booking = require("../models/bookingModel");

const generatePaymentNo = require(
  "../utils/generatePaymentNo"
);

// ============================================================
// CREATE PAYMENT
// ============================================================

// exports.createPayment = async ({
//   bookingId,
//   invoiceId,
//   guestId,
//   amount,
//   paymentMethod,
//   transactionId,
//   paymentDate,
//   remarks,
//   createdBy,
// }) => {
//   const numericAmount =
//     Number(amount);

//   // ----------------------------------------------------------
//   // Validate amount
//   // ----------------------------------------------------------

//   if (
//     !numericAmount ||
//     numericAmount <= 0
//   ) {
//     throw new Error(
//       "Payment amount must be greater than zero"
//     );
//   }

//   // ----------------------------------------------------------
//   // Find Invoice
//   // ----------------------------------------------------------

//   let invoice = null;

//   if (invoiceId) {
//     invoice =
//       await Invoice.findOne({
//         _id: invoiceId,

//         isDeleted: false,
//       });

//     if (!invoice) {
//       throw new Error(
//         "Invoice not found"
//       );
//     }

//     if (
//       invoice.status ===
//       "cancelled"
//     ) {
//       throw new Error(
//         "Cannot make payment for cancelled invoice"
//       );
//     }
//   }

//   // ----------------------------------------------------------
//   // Find Booking
//   // ----------------------------------------------------------

//   let booking = null;

//   if (bookingId) {
//     booking =
//       await Booking.findOne({
//         _id: bookingId,

//         isDeleted: false,
//       });

//     if (!booking) {
//       throw new Error(
//         "Booking not found"
//       );
//     }
//   }

//   // ----------------------------------------------------------
//   // Determine due amount
//   // ----------------------------------------------------------

//   let currentDue = null;

//   if (invoice) {
//     currentDue =
//       Number(invoice.dueAmount || 0);
//   } else if (booking) {
//     currentDue =
//       Number(booking.dueAmount || 0);
//   }

//   // ----------------------------------------------------------
//   // Don't allow overpayment
//   // ----------------------------------------------------------

//   if (
//     currentDue !== null &&
//     numericAmount > currentDue
//   ) {
//     throw new Error(
//       `Payment cannot be greater than pending amount ₹${currentDue}`
//     );
//   }

//   // ----------------------------------------------------------
//   // Create Payment
//   // ----------------------------------------------------------

//   const payment =
//     await Payment.create({
//       paymentNo:
//         generatePaymentNo(),

//       bookingId,

//       invoiceId,

//       guestId,

//       amount:
//         numericAmount,

//       paymentMethod,

//       transactionId,

//       paymentDate:
//         paymentDate ||
//         new Date(),

//       status:
//         "success",

//       remarks,

//       createdBy,
//     });

//   // ----------------------------------------------------------
//   // Update Invoice
//   // ----------------------------------------------------------

//   if (invoice) {
//     invoice.paidAmount =
//       Number(
//         invoice.paidAmount || 0
//       ) +
//       numericAmount;

//     invoice.dueAmount =
//       Math.max(
//         0,
//         Number(
//           invoice.totalAmount
//         ) -
//           invoice.paidAmount
//       );

//     if (
//       invoice.dueAmount === 0
//     ) {
//       invoice.status =
//         "paid";
//     } else {
//       invoice.status =
//         "partially_paid";
//     }

//     invoice.updatedBy =
//       createdBy;

//     await invoice.save();
//   }

//   // ----------------------------------------------------------
//   // Update Booking
//   // ----------------------------------------------------------

//   if (booking) {
//     booking.paidAmount =
//       Number(
//         booking.paidAmount || 0
//       ) +
//       numericAmount;

//     booking.dueAmount =
//       Math.max(
//         0,
//         Number(
//           booking.totalAmount
//         ) -
//           booking.paidAmount
//       );

//     if (
//       booking.dueAmount === 0
//     ) {
//       booking.paymentStatus =
//         "paid";
//     } else {
//       booking.paymentStatus =
//         "partial";
//     }

//     booking.updatedBy =
//       createdBy;

//     await booking.save();
//   }

//   return Payment.findById(
//     payment._id
//   )
//     .populate(
//       "guestId",
//       "guestCode name phone email"
//     )
//     .populate(
//       "bookingId",
//       "bookingNo totalAmount paidAmount dueAmount"
//     )
//     .populate(
//       "invoiceId",
//       "invoiceNo totalAmount paidAmount dueAmount status"
//     );
// };

// ============================================================
// CREATE PAYMENT
// ============================================================

exports.createPayment = async ({
  bookingId,
  invoiceId,
  guestId,
  amount,
  paymentMethod,
  transactionId,
  paymentDate,
  remarks,
  createdBy,
}) => {
  const numericAmount = Number(amount);

  // ----------------------------------------------------------
  // Validate amount
  // ----------------------------------------------------------

  if (
    !numericAmount ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than zero"
    );
  }

  // ----------------------------------------------------------
  // Find Invoice
  // ----------------------------------------------------------

  let invoice = null;

  if (invoiceId) {
    invoice =
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
      invoice.status === "cancelled"
    ) {
      throw new Error(
        "Cannot make payment for cancelled invoice"
      );
    }
  }

  // ----------------------------------------------------------
  // Find Booking
  // ----------------------------------------------------------

  let booking = null;

  if (bookingId) {
    booking =
      await Booking.findOne({
        _id: bookingId,
        isDeleted: false,
      });

    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }
  }

  // ----------------------------------------------------------
  // Determine Current Due
  // ----------------------------------------------------------

  let currentDue = null;

  if (invoice) {
    currentDue =
      Number(invoice.dueAmount || 0);
  } else if (booking) {
    currentDue =
      Number(booking.dueAmount || 0);
  }

  // ----------------------------------------------------------
  // Prevent Overpayment
  // ----------------------------------------------------------

  if (
    currentDue !== null &&
    numericAmount > currentDue
  ) {
    throw new Error(
      `Payment cannot be greater than pending amount ₹${currentDue}`
    );
  }

  // ----------------------------------------------------------
  // Create Payment
  // ----------------------------------------------------------

  const payment =
    await Payment.create({
      paymentNo:
        generatePaymentNo(),

      bookingId,

      invoiceId,

      guestId,

      amount:
        numericAmount,

      paymentMethod,

      transactionId,

      paymentDate:
        paymentDate ||
        new Date(),

      status:
        "success",

      remarks,

      createdBy,
    });

  // ==========================================================
  // UPDATE INVOICE
  // ==========================================================

  if (invoice) {
    // --------------------------------------------------------
    // Get All Successful Payments for Invoice
    // --------------------------------------------------------

    const paymentResult =
      await Payment.aggregate([
        {
          $match: {
            invoiceId:
              invoice._id,

            status:
              "success",

            isDeleted:
              false,
          },
        },

        {
          $group: {
            _id: null,

            totalPaid: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const totalPaid =
      paymentResult.length > 0
        ? Number(
            paymentResult[0].totalPaid
          )
        : 0;

    // --------------------------------------------------------
    // Calculate Due
    // --------------------------------------------------------

    const totalAmount =
      Number(
        invoice.totalAmount || 0
      );

    const dueAmount =
      Math.max(
        0,
        totalAmount - totalPaid
      );

    // --------------------------------------------------------
    // Update Invoice
    // --------------------------------------------------------

    invoice.paidAmount =
      totalPaid;

    invoice.dueAmount =
      dueAmount;

    if (
      dueAmount === 0
    ) {
      invoice.status =
        "paid";
    } else if (
      totalPaid > 0
    ) {
      invoice.status =
        "partially_paid";
    } else {
      invoice.status =
        "issued";
    }

    invoice.updatedBy =
      createdBy;

    await invoice.save();
  }

  // ==========================================================
  // UPDATE BOOKING
  // ==========================================================

  if (booking) {
    // --------------------------------------------------------
    // Get All Successful Payments for Booking
    // --------------------------------------------------------

    const paymentResult =
      await Payment.aggregate([
        {
          $match: {
            bookingId:
              booking._id,

            status:
              "success",

            isDeleted:
              false,
          },
        },

        {
          $group: {
            _id: null,

            totalPaid: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const totalPaid =
      paymentResult.length > 0
        ? Number(
            paymentResult[0].totalPaid
          )
        : 0;

    // --------------------------------------------------------
    // Calculate Booking Due
    // --------------------------------------------------------

    const totalAmount =
      Number(
        booking.totalAmount || 0
      );

    const dueAmount =
      Math.max(
        0,
        totalAmount - totalPaid
      );

    // --------------------------------------------------------
    // Update Booking
    // --------------------------------------------------------

    booking.paidAmount =
      totalPaid;

    booking.dueAmount =
      dueAmount;

    if (
      dueAmount === 0
    ) {
      booking.paymentStatus =
        "paid";
    } else if (
      totalPaid > 0
    ) {
      booking.paymentStatus =
        "partial";
    } else {
      booking.paymentStatus =
        "unpaid";
    }

    booking.updatedBy =
      createdBy;

    await booking.save();
  }

  // ==========================================================
  // RETURN PAYMENT
  // ==========================================================

  return Payment.findById(
    payment._id
  )
    .populate(
      "guestId",
      "guestCode name phone email"
    )
    .populate(
      "bookingId",
      "bookingNo totalAmount paidAmount dueAmount"
    )
    .populate(
      "invoiceId",
      "invoiceNo totalAmount paidAmount dueAmount status"
    );
};

// ============================================================
// GET PAYMENTS
// ============================================================

exports.getPayments = async ({
  bookingId,
  invoiceId,
  paymentMethod,
  status,
}) => {
  const filter = {
    isDeleted: false,
  };

  if (bookingId) {
    filter.bookingId =
      bookingId;
  }

  if (invoiceId) {
    filter.invoiceId =
      invoiceId;
  }

  if (paymentMethod) {
    filter.paymentMethod =
      paymentMethod;
  }

  if (status) {
    filter.status =
      status;
  }

  return Payment.find(filter)
    .populate(
      "guestId",
      "guestCode name phone email"
    )
    .populate(
      "bookingId",
      "bookingNo"
    )
    .populate(
      "invoiceId",
      "invoiceNo"
    )
    .sort({
      paymentDate: -1,
    });
};

// ============================================================
// GET PAYMENT BY ID
// ============================================================

exports.getPaymentById = async (
  paymentId
) => {
  const payment =
    await Payment.findOne({
      _id: paymentId,

      isDeleted: false,
    })
      .populate("guestId")
      .populate("bookingId")
      .populate("invoiceId");

  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }

  return payment;
};

// ============================================================
// DELETE PAYMENT
// ============================================================

exports.deletePayment = async ({
  paymentId,
  updatedBy,
}) => {
  const payment =
    await Payment.findOne({
      _id: paymentId,

      isDeleted: false,
    });

  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }

  // Only reverse successful payment

  if (
    payment.status ===
    "success"
  ) {
    // --------------------------------------------------------
    // Reverse Invoice
    // --------------------------------------------------------

    if (payment.invoiceId) {
      const invoice =
        await Invoice.findById(
          payment.invoiceId
        );

      if (invoice) {
        invoice.paidAmount =
          Math.max(
            0,
            Number(
              invoice.paidAmount || 0
            ) -
              Number(payment.amount)
          );

        invoice.dueAmount =
          Math.max(
            0,
            Number(
              invoice.totalAmount
            ) -
              invoice.paidAmount
          );

        if (
          invoice.dueAmount === 0
        ) {
          invoice.status =
            "paid";
        } else if (
          invoice.paidAmount > 0
        ) {
          invoice.status =
            "partially_paid";
        } else {
          invoice.status =
            "issued";
        }

        invoice.updatedBy =
          updatedBy;

        await invoice.save();
      }
    }

    // --------------------------------------------------------
    // Reverse Booking
    // --------------------------------------------------------

    if (payment.bookingId) {
      const booking =
        await Booking.findById(
          payment.bookingId
        );

      if (booking) {
        booking.paidAmount =
          Math.max(
            0,
            Number(
              booking.paidAmount || 0
            ) -
              Number(payment.amount)
          );

        booking.dueAmount =
          Math.max(
            0,
            Number(
              booking.totalAmount
            ) -
              booking.paidAmount
          );

        if (
          booking.dueAmount === 0
        ) {
          booking.paymentStatus =
            "paid";
        } else if (
          booking.paidAmount > 0
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
    }
  }

  payment.isDeleted =
    true;

  await payment.save();

  return payment;
};