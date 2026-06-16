const connectDB = require("../config/db");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
require("dotenv").config();

const sampleDoctors = [
  {
    name: "Dr. Suhail",
    email: "suhail@doctor.com",
    speciality: "General physician",
    qualification: "MBBS, MD",
    experience: "10 years",
    licenseNumber: "LIC001",
    bio: "Experienced general physician focused on preventive care.",
    fees: 500,
    rating: 4.5,
  },
  {
    name: "Dr. Aqsaa",
    email: "aqsaa@doctor.com",
    speciality: "Gynecologist",
    qualification: "MBBS, DGO",
    experience: "8 years",
    licenseNumber: "LIC002",
    bio: "Skilled gynecologist with years of clinical practice.",
    fees: 600,
    rating: 4.2,
  },
  {
    name: "Dr. Saleem",
    email: "saleem@doctor.com",
    speciality: "Dermatologist",
    qualification: "MBBS, MD Dermatology",
    experience: "12 years",
    licenseNumber: "LIC003",
    bio: "Dermatology specialist for skin and hair issues.",
    fees: 550,
    rating: 4.3,
  },
];

async function seed() {
  await connectDB(
    process.env.MONGO_URI || "mongodb://172.28.37.117:5000/sountabeeb",
  );
  try {
    // First, create users for each doctor
    const users = await User.insertMany(
      sampleDoctors.map((d) => ({
        name: d.name,
        email: d.email,
        password: "hashedPassword123", // In real scenario, this should be hashed
        role: "doctor",
      })),
    );

    // Then create doctors linked to the users
    await Doctor.deleteMany({});
    await Doctor.insertMany(
      sampleDoctors.map((d, idx) => ({
        user: users[idx]._id,
        name: d.name,
        email: d.email,
        speciality: d.speciality,
        qualification: d.qualification,
        experience: d.experience,
        licenseNumber: d.licenseNumber,
        bio: d.bio,
        fees: d.fees,
        rating: d.rating,
      })),
    );
    console.log("Seeded doctors with users");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
