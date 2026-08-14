const express = require("express");

const router = express.Router();

const housekeepingController =
  require("../controllers/housekeepingController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  housekeepingController.createTask
);

router.get(
  "/all",
  verifyToken,
  housekeepingController.getTasks
);

router.put(
  "/status/:id",
  verifyToken,
  housekeepingController.updateTaskStatus
);

module.exports = router;