const express = require("express");

const router = express.Router();

const invoiceController =
  require("../controllers/invoiceController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

// ============================================================
// CREATE INVOICE
// ============================================================

router.post(
  "/create",
  verifyToken,
  invoiceController.createInvoice
);

// ============================================================
// GET ALL INVOICES
// ============================================================

router.get(
  "/all",
  verifyToken,
  invoiceController.getInvoices
);

// ============================================================
// GET INVOICES BY BOOKING
// IMPORTANT: Keep this BEFORE /:id
// ============================================================

router.get(
  "/booking/:bookingId",
  verifyToken,
  invoiceController.getInvoicesByBooking
);

// ============================================================
// GET INVOICE BY ID
// ============================================================

router.get(
  "/:id",
  verifyToken,
  invoiceController.getInvoiceById
);

// ============================================================
// UPDATE INVOICE
// ============================================================

router.put(
  "/update/:id",
  verifyToken,
  invoiceController.updateInvoice
);

// ============================================================
// CANCEL INVOICE
// ============================================================

router.put(
  "/cancel/:id",
  verifyToken,
  invoiceController.cancelInvoice
);

// ============================================================
// DELETE INVOICE
// ============================================================

router.delete(
  "/delete/:id",
  verifyToken,
  invoiceController.deleteInvoice
);

module.exports = router;