const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const connectDB = require("./config/db");
const User = require("./models/User");
const appointmentReminder = require("./utils/appointmentReminder");

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Input Sanitization Middleware
app.use((req, res, next) => {
  // Sanitize all string inputs
  const sanitizeObj = (obj) => {
    if (typeof obj === "string") {
      return obj.trim();
    }
    if (typeof obj === "object" && obj !== null) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = sanitizeObj(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObj(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObj(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObj(req.params);
  }

  next();
});
const path = require("path");

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(
    process.env.MONGO_URI || "mongodb://172.28.37.117:5000/sountabeeb",
  );

  // Start appointment reminder scheduler
  appointmentReminder.startReminderScheduler();

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
