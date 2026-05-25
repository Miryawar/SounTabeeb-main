const connectDB = require("../config/db");
const Doctor = require("../models/Doctor");
require("dotenv").config();

const sampleDoctors = [
  {
    name: "Dr. Suhail",
    specialty: "General physician",
    bio: "Experienced general physician focused on preventive care.",
    rating: 4.5,
  },
  {
    name: "Dr. Aqsaa",
    specialty: "Gynecologist",
    bio: "Skilled gynecologist with years of clinical practice.",
    rating: 4.2,
  },
  {
    name: "Dr. Saleem",
    specialty: "Dermatologist",
    bio: "Dermatology specialist for skin and hair issues.",
    rating: 4.3,
  },
];

async function seed() {
  await connectDB(
    process.env.MONGO_URI || "mongodb://localhost:27017/sountabeeb",
  );
  try {
    await Doctor.deleteMany({});
    await Doctor.insertMany(
      sampleDoctors.map((d) => ({
        name: d.name,
        specialty: d.specialty,
        bio: d.bio,
        rating: d.rating,
      })),
    );
    console.log("Seeded doctors");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
