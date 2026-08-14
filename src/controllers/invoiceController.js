const invoiceService = require(
  "../services/invoiceService"
);

// ============================================================
// CREATE
// ============================================================

exports.createInvoice = async (
  req,
  res
) => {
  try {
    const invoice =
      await invoiceService.createInvoice({
        ...req.body,

        createdBy:
          req.user?._id,
      });

    res.status(201).json({
      success: true,

      message:
        "Invoice created successfully",

      data: invoice,
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
// GET ALL
// ============================================================

exports.getInvoices = async (
  req,
  res
) => {
  try {
    const invoices =
      await invoiceService.getInvoices({
        status:
          req.query.status,

        search:
          req.query.search,
      });

    res.json({
      success: true,

      count:
        invoices.length,

      data: invoices,
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
// GET BY ID
// ============================================================

exports.getInvoiceById = async (
  req,
  res
) => {
  try {
    const result =
      await invoiceService.getInvoiceById(
        req.params.id
      );

    res.json({
      success: true,

      data: result,
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
// GET BY BOOKING
// ============================================================

exports.getInvoicesByBooking =
  async (req, res) => {
    try {
      const invoices =
        await invoiceService.getInvoicesByBooking(
          req.params.bookingId
        );

      res.json({
        success: true,

        count:
          invoices.length,

        data: invoices,
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
// UPDATE
// ============================================================

exports.updateInvoice = async (
  req,
  res
) => {
  try {
    const invoice =
      await invoiceService.updateInvoice({
        invoiceId:
          req.params.id,

        data:
          req.body,

        updatedBy:
          req.user?._id,
      });

    res.json({
      success: true,

      message:
        "Invoice updated successfully",

      data: invoice,
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
// CANCEL
// ============================================================

exports.cancelInvoice = async (
  req,
  res
) => {
  try {
    const invoice =
      await invoiceService.cancelInvoice({
        invoiceId:
          req.params.id,

        updatedBy:
          req.user?._id,
      });

    res.json({
      success: true,

      message:
        "Invoice cancelled successfully",

      data: invoice,
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
// DELETE
// ============================================================

exports.deleteInvoice = async (
  req,
  res
) => {
  try {
    await invoiceService.deleteInvoice({
      invoiceId:
        req.params.id,

      updatedBy:
        req.user?._id,
    });

    res.json({
      success: true,

      message:
        "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};