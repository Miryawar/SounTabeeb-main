const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  // `date` is stored as the appointment day (time normalized to midnight)
  date: { type: Date, required: true },
  // `slot` is a discrete slot identifier (e.g. "09:00" or "09:00-09:30")
  slot: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  payment: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
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
