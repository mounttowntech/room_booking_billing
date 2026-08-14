const express = require("express");

const router = express.Router();

const settingController = require("../controllers/settingController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");


// ============================================================
// CREATE SETTINGS
// ============================================================

router.post(
  "/create",
  verifyToken,
  settingController.createSettings
);


// ============================================================
// GET SETTINGS
// ============================================================

router.get(
  "/all",
  verifyToken,
  settingController.getSettings
);


// ============================================================
// UPDATE SETTINGS
// ============================================================

router.put(
  "/update/:id",
  verifyToken,
  settingController.updateSettings
);


// ============================================================
// UPDATE SETTINGS STATUS
// ============================================================

router.put(
  "/status/:id",
  verifyToken,
  settingController.updateSettingsStatus
);


// ============================================================
// DELETE SETTINGS
// ============================================================

router.delete(
  "/delete/:id",
  verifyToken,
  settingController.deleteSettings
);


module.exports = router;