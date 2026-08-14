const paymentService = require(
  "../services/paymentService"
);

// ============================================================
// CREATE PAYMENT
// ============================================================

exports.createPayment = async (
  req,
  res
) => {
  try {
    const payment =
      await paymentService.createPayment({
        ...req.body,

        createdBy:
          req.user?._id,
      });

    res.status(201).json({
      success: true,

      message:
        "Payment recorded successfully",

      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ============================================================
// GET PAYMENTS
// ============================================================

exports.getPayments = async (
  req,
  res
) => {
  try {
    const payments =
      await paymentService.getPayments({
        bookingId:
          req.query.bookingId,

        invoiceId:
          req.query.invoiceId,

        paymentMethod:
          req.query.paymentMethod,

        status:
          req.query.status,
      });

    res.json({
      success: true,

      count:
        payments.length,

      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ============================================================
// GET PAYMENT BY ID
// ============================================================

exports.getPaymentById = async (
  req,
  res
) => {
  try {
    const payment =
      await paymentService.getPaymentById(
        req.params.id
      );

    res.json({
      success: true,

      data: payment,
    });
  } catch (error) {
    res.status(404).json({
      success: false,

      message:
        error.message,
    });
  }
};

// ============================================================
// DELETE PAYMENT
// ============================================================

exports.deletePayment = async (
  req,
  res
) => {
  try {
    await paymentService.deletePayment({
      paymentId:
        req.params.id,

      updatedBy:
        req.user?._id,
    });

    res.json({
      success: true,

      message:
        "Payment deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};