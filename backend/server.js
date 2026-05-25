require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/sountabeeb");

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/appointments", require("./routes/appointments"));

app.get("/", (req, res) => res.send("SounTabeeb backend running"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
