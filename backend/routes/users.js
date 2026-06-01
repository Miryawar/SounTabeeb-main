const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/userController");
const User = require("../models/User");
router.get("/me", auth, getProfile);
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = new User({
      name,
      email,
      password,
      phone,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "user registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;
