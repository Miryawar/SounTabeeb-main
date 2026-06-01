const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  phone: { type: Number },

  dob: { type: String },

  gender: { type: String },

  address: { type: String },

  city: { type: String },

  district: { type: String },

  state: { type: String },

  pincode: { type: String },

  password: { type: String, required: true },

  role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
