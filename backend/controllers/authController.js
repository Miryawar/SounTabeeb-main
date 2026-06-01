const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

exports.register = async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  const {
    name,
    email,
    password,
    phone,
    role,
    profilePicture,
    bio,
    speciality,
    qualification,
    experience,
    licenseNumber,
  } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashed,
      phone,
      role: role || "user",
    };

    user = new User(userData);
    await user.save();

    let doctorProfile = null;
    if (role === "doctor") {
      const doctorData = {
        user: user._id,
        name,
        email,
        profilePicture: profilePicture || "",
        bio: bio || "",
        speciality: speciality || "",
        qualification: qualification || "",
        experience: experience || "",
        licenseNumber: licenseNumber || "",
      };
      doctorProfile = await Doctor.create(doctorData);
      user.doctor = doctorProfile._id;
      await user.save();
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    const responseUser = {
      id: user._id,
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
    };

    if (doctorProfile) {
      responseUser.profilePicture = doctorProfile.profilePicture || "";
      responseUser.bio = doctorProfile.bio || "";
      responseUser.speciality = doctorProfile.speciality || "";
      responseUser.qualification = doctorProfile.qualification || "";
      responseUser.experience = doctorProfile.experience || "";
      responseUser.licenseNumber = doctorProfile.licenseNumber || "";
    }

    res.json({ token, user: responseUser });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message: err.message,
      // stack: err.stack
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
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
        profilePicture: doctorProfile?.profilePicture || "",
        bio: doctorProfile?.bio || "",
        speciality: doctorProfile?.speciality || "",
        qualification: doctorProfile?.qualification || "",
        experience: doctorProfile?.experience || "",
        licenseNumber: doctorProfile?.licenseNumber || "",
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
