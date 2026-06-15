const express = require("express");

const router = express.Router();

const {
  register,
  login,
  sendEmailVerification,
  verifyEmail,
  sendPhoneCode,
  verifyPhone,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);
router.post("/send-phone-code", sendPhoneCode);
router.post("/verify-phone", verifyPhone);
router.post(
  "/complete-register",
  require("../controllers/authController").completeRegister,
);

module.exports = router;
