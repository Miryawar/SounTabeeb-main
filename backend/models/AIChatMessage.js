const mongoose = require("mongoose");

const aiChatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  text: { type: String, required: true },
  provider: {
    type: String,
    enum: ["openai", "gemini", "local", "fallback", "user"],
    default: "local",
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIChatMessage", aiChatMessageSchema);
