const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  handleAiChat,
  getChatHistory,
} = require("../controllers/aiChatController");

router.post("/", auth, handleAiChat);
router.get("/history", auth, getChatHistory);

module.exports = router;
