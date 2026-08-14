const express = require("express");

const router = express.Router();

const reportController =
  require("../controllers/reportController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.get(
  "/revenue",
  verifyToken,
  reportController.revenueReport
);

router.get(
  "/bookings",
  verifyToken,
  reportController.bookingReport
);

module.exports = router;