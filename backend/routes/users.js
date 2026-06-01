const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const { getProfile } = require("../controllers/userController");
router.get("/me", auth, getProfile);

const { updateProfile } = require("../controllers/userController");
router.put("/me", auth, updateProfile);
