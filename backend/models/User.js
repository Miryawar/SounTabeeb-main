const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  phone: { type: String, required: true },

  password: { type: String, required: true },

  dob: String,
  address: String,
  city: String,
  state: String,
  district: String,
  pincode: String,
  gender: String,

  role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
