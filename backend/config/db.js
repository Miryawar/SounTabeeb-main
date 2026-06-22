const mongoose = require("mongoose");

const connectDB = async (uri) => {
  const localFallback = process.env.MONGO_FALLBACK_URI;
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 50000,
    family: 4,
    keepAlive: true, // Added this line to prevent idle network drops
  };

  try {
    await mongoose.connect(uri, connectionOptions);
    console.log("MongoDB connected");
    return;
  } catch (err) {
    if (localFallback) {
      console.warn(
        "Attempting local MongoDB fallback using MONGO_FALLBACK_URI.",
      );
      try {
        await mongoose.connect(localFallback, connectionOptions);
        console.log("MongoDB connected using local fallback URI");
        return;
      } catch (localErr) {
        console.error("Local fallback connection error:", localErr.message);
      }
    }

    console.error("MongoDB connection error", err.message || err);
    process.exit(1);
  }
};

module.exports = connectDB;