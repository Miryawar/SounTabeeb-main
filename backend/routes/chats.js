const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getMessages,
  createMessage,
  getConversations,
} = require("../controllers/chatController");

router.get("/", auth, getConversations);
router.get("/:doctorId", auth, getMessages);
router.post("/:doctorId", auth, createMessage);

module.exports = router;
