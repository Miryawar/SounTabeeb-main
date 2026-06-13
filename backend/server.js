const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
const path = require("path");

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(
    process.env.MONGO_URI || "mongodb://172.28.37.117:5000/sountabeeb",
  );

  // Routes
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/doctors", require("./routes/doctors"));
  app.use("/api/chats", require("./routes/chats"));
  app.use("/api/ai-chat", require("./routes/aiChat"));
  app.use("/api/appointments", require("./routes/appointments"));

  app.get("/", (req, res) => res.send("SounTabeeb backend running"));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Server error" });
  });

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Server running on port ${PORT}`),
  );
};

startServer().catch((err) => {
  console.error("Server failed to start:", err.message || err);
  process.exit(1);
});
