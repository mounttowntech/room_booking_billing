const express = require("express");

const router = express.Router();

// ============================================================
// CONTROLLER
// ============================================================

const {
  register,
  login,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPasswordUsingOTP,
  resetPassword,
  changePassword,
  me,
} = require("../controllers/authController");

// ============================================================
// MIDDLEWARE
// ============================================================

const {verifyToken} = require("../middleware/authMiddleware");

// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

router.post(
  "/register",
  register
);

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post(
  "/login",
  login
);

// ============================================================
// FORGOT PASSWORD
// Sends OTP + Reset Password Link
// POST /api/auth/forgot-password
// ============================================================

router.post(
  "/forgot-password",
  forgotPassword
);

// ============================================================
// VERIFY FORGOT PASSWORD OTP
// POST /api/auth/verify-forgot-password-otp
// ============================================================

router.post(
  "/verify-forgot-password-otp",
  verifyForgotPasswordOTP
);

// ============================================================
// RESET PASSWORD USING OTP
// POST /api/auth/reset-password-otp
// ============================================================

router.post(
  "/reset-password",
  resetPasswordUsingOTP
);

// ============================================================
// RESET PASSWORD USING EMAIL LINK
// POST /api/auth/reset-password
// ============================================================



// ============================================================
// CHANGE PASSWORD
// Requires Login
// POST /api/auth/change-password
// ============================================================

router.post(
  "/change-password",
  verifyToken,
  changePassword
);

// ============================================================
// GET CURRENT USER
// Requires Login
// GET /api/auth/me
// ============================================================

router.get(
  "/me",
  verifyToken,
  me
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;