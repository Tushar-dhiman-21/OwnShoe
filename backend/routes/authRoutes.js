
const express = require("express");

const {
  register,
  verifySignupOTP,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", register);

// Verify Signup Email OTP
router.post("/verify-signup-otp", verifySignupOTP);

// Login
router.post("/login", login);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Verify Forgot Password OTP
router.post("/verify-otp", verifyOTP);

// Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;
