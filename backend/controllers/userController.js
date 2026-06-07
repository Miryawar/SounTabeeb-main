const Doctor = require("../models/Doctor");

exports.getProfile = async (req, res) => {
  try {
    const user = req.user.toObject();
    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id }).lean();
    }

    const profile = {
      ...user,
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
      speciality: doctorProfile?.speciality || "",
      qualification: doctorProfile?.qualification || "",
      experience: doctorProfile?.experience || "",
      licenseNumber: doctorProfile?.licenseNumber || "",
      bio: doctorProfile?.bio || "",
    };

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log("UPDATE PROFILE - User ID:", req.user._id);
    console.log("UPDATE PROFILE - Request Body:", req.body);

    const updates = {
      dob: req.body.dob,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      district: req.body.district,
      pincode: req.body.pincode,
      gender: req.body.gender,
    };

    if (req.body.phone) {
      updates.phone = Number(req.body.phone);
    }

    console.log("UPDATE PROFILE - Updates object:", updates);

    const user = await req.user.constructor
      .findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("UPDATE PROFILE - Updated user:", user.toObject());

    res.json({
      ...user.toObject(),
      phone: user.phone || "",
      dob: user.dob || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      district: user.district || "",
      pincode: user.pincode || "",
      gender: user.gender || "",
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({ message: "No image provided" });
    }

    const user = await req.user.constructor
      .findByIdAndUpdate(req.user._id, { profilePicture }, { new: true })
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error("UPLOAD PROFILE PICTURE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeProfilePicture = async (req, res) => {
  try {
    const user = await req.user.constructor
      .findByIdAndUpdate(req.user._id, { profilePicture: null }, { new: true })
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile picture removed successfully" });
  } catch (err) {
    console.error("REMOVE PROFILE PICTURE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
