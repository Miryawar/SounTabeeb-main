const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "doctor"], default: "user" },
  profilePicture: String,
  bio: String,
  speciality: String,
  qualification: String,
  experience: String,
  licenseNumber: String,
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
