const Doctor = require("../models/Doctor");
const fs = require("fs");
const path = require("path");

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

    let doctor = await Doctor.findOne({ user: user._id });

    // If the doctor profile doesn't exist yet, create one so edits can be saved
    if (!doctor) {
      console.log(
        "Doctor profile missing for user, creating new doctor profile",
        user._id,
      );
      doctor = await Doctor.create({
        user: user._id,
        name: user.name || "",
        email: user.email || "",
      });
      // also attach to user record if needed
      try {
        const User = require("../models/User");
        await User.findByIdAndUpdate(user._id, { doctor: doctor._id });
      } catch (e) {
        console.warn(
          "Failed to attach doctor id to user record:",
          e.message || e,
        );
      }
    }

    const allowedFields = [
      "profilePicture",
      "speciality",
      "qualification",
      "experience",
      "licenseNumber",
      "bio",
    ];

    // Handle profile picture base64 upload (data URI)
    if (
      req.body.profilePicture &&
      typeof req.body.profilePicture === "string"
    ) {
      const pp = req.body.profilePicture;
      if (pp.startsWith("data:")) {
        // decode and save file
        const matches = pp.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const mime = matches[1];
          const ext = mime.split("/")[1] || "jpg";
          const b64 = matches[2];
          const filename = `${doctor._id || user._id}-${Date.now()}.${ext}`;
          const uploadsDir = path.join(__dirname, "..", "uploads");
          if (!fs.existsSync(uploadsDir))
            fs.mkdirSync(uploadsDir, { recursive: true });
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, Buffer.from(b64, "base64"));
          // build public URL
          const protocol = req.protocol;
          const host = req.get("host");
          const url = `${protocol}://${host}/uploads/${filename}`;
          doctor.profilePicture = url;
        }
      } else if (pp.startsWith("http") || pp.startsWith("/uploads/")) {
        // already a URL
        doctor.profilePicture = pp;
      }
    }

    allowedFields.forEach((field) => {
      if (field === "profilePicture") return; // already handled
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
    console.error("UPDATE DOCTOR PROFILE ERROR:", err.message || err);
    res.status(500).json({ message: "Server error" });
  }
};
