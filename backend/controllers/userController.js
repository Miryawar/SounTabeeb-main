exports.getProfile = async (req, res) => {
  try {
    const user = req.user.toObject();
    res.json({
      ...user,
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
