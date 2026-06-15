const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  create,
  listForUser,
  cancel,
  updateStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/appointmentController");

router.post("/", auth, create);
router.get("/", auth, listForUser);
router.post("/:id/cancel", auth, cancel);
router.put("/:id/status", auth, updateStatus);
router.post("/razorpay/order", auth, createRazorpayOrder);
router.post("/razorpay/verify", auth, verifyRazorpayPayment);

module.exports = router;
