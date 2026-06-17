const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  phone: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  dob: String,
  address: String,
  city: String,
  state: String,
  district: String,
  pincode: String,
  gender: String,
  profilePicture: {
    type: String,
    default: null,
  },

  role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },

  // Push notification token for Expo
  pushToken: { type: String, default: null },

  // verification fields
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  phoneVerified: { type: Boolean, default: false },
  phoneVerificationCode: { type: String, default: null },
  phoneVerificationExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  resetOtp: { type: String, default: null },
  resetOtpExpires: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
