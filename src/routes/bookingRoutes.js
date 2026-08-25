const express = require("express");

const router = express.Router();

const bookingController =
  require("../controllers/bookingController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  bookingController.createBooking
);

// update booking
router.put(
  "/:id",
  verifyToken,
  bookingController.updateBooking
);

router.get(
  "/all",
  verifyToken,
  bookingController.getBookings
);

// get  all booking payment summary
router.get("/payment-summary", verifyToken, bookingController.getBookingPaymentSummary);

router.get(
  "/:id",
  verifyToken,
  bookingController.getBookingById
);

router.put(
  "/check-in/:id",
  verifyToken,
  bookingController.checkIn
);

router.put(
  "/check-out/:id",
  verifyToken,
  bookingController.checkOut
);

router.put(
  "/cancel/:id",
  verifyToken,
  bookingController.cancelBooking
);

module.exports = router;