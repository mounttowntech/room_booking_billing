const express = require("express");

const router = express.Router();

const dashboardController =
  require("../controllers/dashboardController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.get(
  "/all",
  verifyToken,
  dashboardController.getDashboard
);

module.exports = router;