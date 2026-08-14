const express = require("express");

const router = express.Router();

const roomController = require("../controllers/roomController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  roomController.createRoom
);

router.get(
  "/all",
  verifyToken,
  roomController.getRooms
);

router.get(
  "/:id",
  verifyToken,
  roomController.getRoomById
);

router.put(
  "/update/:id",
  verifyToken,
  roomController.updateRoom
);

router.delete(
  "/delete/:id",
  verifyToken,
  roomController.deleteRoom
);

module.exports = router;