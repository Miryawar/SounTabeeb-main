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
  requestReschedule,
  respondRescheduleRequest,
  getTransactionHistory,
  recordPaymentStatus,
} = require("../controllers/appointmentController");

router.post("/", auth, create);
router.get("/", auth, listForUser);
router.post("/:id/cancel", auth, cancel);
router.put("/:id/status", auth, updateStatus);
router.post("/:id/reschedule", auth, requestReschedule);
router.post("/:id/reschedule-response", auth, respondRescheduleRequest);
router.post("/razorpay/order", auth, createRazorpayOrder);
router.post("/razorpay/verify", auth, verifyRazorpayPayment);
router.get("/transactions/history", auth, getTransactionHistory);
router.post("/transactions/status", auth, recordPaymentStatus);

module.exports = router;
