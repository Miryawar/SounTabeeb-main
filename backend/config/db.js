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
    

    console.error("MongoDB connection error", err.message);
    process.exit(1);
}};


module.exports = connectDB;

// const mongoose = require("mongoose");

// const connectDB = async () => {
//   console.log(process.env.MONGO_URI);
//   try {
//     await mongoose.connect(process.env.MONGO_URI);

//     console.log("MongoDB Connected");
//   } catch (error) {
//     console.error("Name:", error.name);
//     console.error("Message:", error.message);
//     console.error("Code:", error.code);
//     console.error(error);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
