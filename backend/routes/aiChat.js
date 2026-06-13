const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { handleAiChat } = require("../controllers/aiChatController");

router.post("/", auth, handleAiChat);

module.exports = router;
