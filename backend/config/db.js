const mongoose = require("mongoose");

const connectDB = async (uri) => {
  const localFallback = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
    return;
  } catch (err) {
    const isSrvError =
      err.code === "ENOTFOUND" ||
      err.code === "ECONNREFUSED" ||
      (err.message && err.message.includes("querySrv"));

    if (uri.startsWith("mongodb+srv://") && isSrvError) {
      console.error("MongoDB Atlas SRV/DNS lookup failed:", err.message);
      console.error(
        "Your environment appears to block DNS SRV/A resolution for Atlas hostnames.",
      );
      console.error(
        "Use a standard Atlas connection string or enable a local Mongo fallback.",
      );

      if (localFallback) {
        console.warn(
          "Attempting local MongoDB fallback using MONGO_FALLBACK_URI.",
        );
        try {
          await mongoose.connect(localFallback, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          console.log("MongoDB connected using local fallback URI");
          return;
        } catch (localErr) {
          console.error("Local fallback connection error:", localErr.message);
        }
      }
    }

    console.error("MongoDB connection error", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

// mongoose.connect(
//   "mongodb+srv://miryawar:Raway01@cluster0.xbiys1k.mongodb.net/?retryWrites=true&w=majority"
// )
// .then(() => console.log("MongoDB Connected"))
// .catch((err) => console.log(err));
