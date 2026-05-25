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
