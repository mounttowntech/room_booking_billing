const express = require("express");

const router = express.Router();

const guestController =
  require("../controllers/guestController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  guestController.createGuest
);

router.get(
  "/all",
  verifyToken,
  guestController.getGuests
);

router.get(
  "/:id",
  verifyToken,
  guestController.getGuestById
);

router.put(
  "/update/:id",
  verifyToken,
  guestController.updateGuest
);

router.delete(
  "/delete/:id",
  verifyToken,
  guestController.deleteGuest
);

module.exports = router;