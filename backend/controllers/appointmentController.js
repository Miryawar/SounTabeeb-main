const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

exports.create = async (req, res) => {
  const { doctorId, date } = req.body;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const appt = new Appointment({
      user: req.user._id,
      doctor: doctorId,
      date,
    });
    await appt.save();
    res.json(appt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.listForUser = async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user._id }).populate(
      "doctor",
    );
    res.json(appts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.cancel = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });
    if (!appt.user.equals(req.user._id))
      return res.status(403).json({ message: "Not allowed" });
    appt.status = "cancelled";
    await appt.save();
    res.json(appt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
