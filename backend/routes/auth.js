const express = require("express");

const router = express.Router();

const {
  register,
  login,
  sendEmailVerification,
  verifyEmail,
  sendPhoneCode,
  verifyPhone,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);
router.post("/send-phone-code", sendPhoneCode);
router.post("/verify-phone", verifyPhone);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post(
  "/complete-register",
  require("../controllers/authController").completeRegister,
);

module.exports = router;
