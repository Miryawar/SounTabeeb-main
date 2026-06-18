const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

const findDoctorByUser = async (userId) => {
  let doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    doctor = await Doctor.findById(userId);
  }
  return doctor;
};

const buildMonthlyRevenue = (appointments) => {
  const months = {};
  appointments.forEach((appt) => {
    const date = new Date(appt.date);
    const label = `${date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    })}`;
    const amount = Number(appt.payment?.amount) || 0;
    months[label] = (months[label] || 0) + amount;
  });
  return Object.entries(months).map(([month, revenue]) => ({
    month,
    revenue,
  }));
};

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

exports.getMyAppointments = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("user", "name email phone profilePicture")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error("GET MY APPOINTMENTS ERROR:", err.message || err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyPatients = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    }).populate("user", "name email phone profilePicture");

    const patientsMap = new Map();
    appointments.forEach((appt) => {
      if (appt.user) {
        const userData = appt.user;
        patientsMap.set(String(userData._id), {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          profilePicture: userData.profilePicture || null,
        });
      }
    });

    res.json(Array.from(patientsMap.values()));
  } catch (err) {
    console.error("GET MY PATIENTS ERROR:", err.message || err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyEarnings = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
      status: { $in: ["confirmed", "completed"] },
    });

    const totalRevenue = appointments.reduce(
      (sum, appt) => sum + (Number(appt.payment?.amount) || 0),
      0,
    );
    const completedCount = appointments.filter(
      (appt) => appt.status === "completed",
    ).length;
    const confirmedCount = appointments.filter(
      (appt) => appt.status === "confirmed",
    ).length;

    res.json({
      totalRevenue,
      completedCount,
      confirmedCount,
      appointmentCount: appointments.length,
      monthlyRevenue: buildMonthlyRevenue(appointments),
    });
  } catch (err) {
    console.error("GET MY EARNINGS ERROR:", err.message || err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const doctor = await Doctor.findOne({ user: user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await User.findById(patientId).select(
      "name email phone profilePicture",
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
      user: patientId,
    })
      .sort({ date: -1 })
      .populate("doctor", "name speciality profilePicture");

    res.json({
      patient,
      history: appointments,
    });
  } catch (err) {
    console.error("GET PATIENT HISTORY ERROR:", err.message || err);
    res.status(500).json({ message: "Server error" });
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
      "fees",
      "workingHours",
      "leaves",
    ];

    // Handle profile picture updates and removal
    if (req.body.profilePicture !== undefined) {
      const pp = req.body.profilePicture;
      if (typeof pp === "string" && pp.trim() === "") {
        doctor.profilePicture = null;
      } else if (typeof pp === "string") {
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
          doctor.profilePicture = pp;
        }
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
      fees: doctor.fees || 0,
      workingHours: doctor.workingHours || [],
      leaves: doctor.leaves || [],
    });
  } catch (err) {
    console.error("UPDATE DOCTOR PROFILE ERROR:", err.message || err);
    res.status(500).json({ message: "Server error" });
  }
};
