const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  method: { type: String, enum: ["UPI", "Card", "Razorpay"], required: true },
  
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  
  transactionRef: { type: String, unique: true, sparse: true },
  upiId: String,
  orderId: String,
  paymentId: String,
  
  failureReason: String,
  
  metadata: mongoose.Schema.Types.Mixed,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
