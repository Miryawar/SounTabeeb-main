const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  const { name, email, password, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashed, phone });
    await user.save();
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  }catch (err) {
    console.error("REGISTER ERROR:", err);
  
    res.status(500).json({
      message: err.message,
      // stack: err.stack
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
