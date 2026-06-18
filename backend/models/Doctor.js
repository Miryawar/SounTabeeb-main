const mongoose = require("mongoose");

const workingHourSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    required: true,
  },
  start: { type: String, default: "09:00" },
  end: { type: String, default: "17:00" },
  active: { type: Boolean, default: false },
});

const leaveSchema = new mongoose.Schema({
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: String,
  speciality: String,
  qualification: String,
  experience: String,
  licenseNumber: String,
  bio: { type: String },
  fees: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  workingHours: { type: [workingHourSchema], default: [] },
  leaves: { type: [leaveSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", doctorSchema);
