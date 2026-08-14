const express = require("express");

const router = express.Router();

const paymentController =
  require("../controllers/paymentController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  paymentController.createPayment
);

router.get(
  "/all",
  verifyToken,
  paymentController.getPayments
);

module.exports = router;