const Doctor = require("../models/Doctor");

exports.list = async (req, res) => {
  try {
    const doctors = await Doctor.find().limit(50);
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.get = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const allowedFields = [
      "profilePicture",
      "speciality",
      "qualification",
      "experience",
      "licenseNumber",
      "bio",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    await doctor.save();

    res.json({
      id: user._id,
      doctorId: doctor._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      dob: user.dob || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      district: user.district || "",
      pincode: user.pincode || "",
      gender: user.gender || "",
      role: user.role || "user",
      profilePicture: doctor.profilePicture || "",
      speciality: doctor.speciality || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience || "",
      licenseNumber: doctor.licenseNumber || "",
      bio: doctor.bio || "",
    });
  } catch (err) {
    console.error("UPDATE DOCTOR PROFILE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
