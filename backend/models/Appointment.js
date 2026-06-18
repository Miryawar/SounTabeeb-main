const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: { type: Date, required: true },
  slot: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
    default: "pending",
  },
  approval: {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    doctorNotes: String,
    requestedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  rescheduleRequest: {
    type: new mongoose.Schema(
      {
        requestedBy: {
          type: String,
          enum: ["user", "doctor"],
          default: "user",
        },
        requestedDate: Date,
        requestedSlot: String,
        reason: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "cancelled"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
      { _id: false },
    ),
    default: undefined,
  },
  payment: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Prevent double-booking at the database level for active slots
appointmentSchema.index(
  { doctor: 1, date: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
