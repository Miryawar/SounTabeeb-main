const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

exports.create = async (req, res) => {
  const { doctorId, date, paymentInfo } = req.body;
  try {
    if (!doctorId || !date) {
      return res.status(400).json({ message: "Doctor and date are required" });
    }

    // Require payment information for new appointments
    if (
      !paymentInfo ||
      !paymentInfo.method ||
      !paymentInfo.txnRef ||
      !paymentInfo.amount
    ) {
      return res.status(400).json({
        message:
          "Valid payment information is required. Please complete UPI payment before proceeding.",
      });
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    // Accept either a Doctor._id or a User._id for doctorId
    let doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      // maybe client passed the doctor's user id — try to resolve
      doctor = await Doctor.findOne({ user: doctorId });
    }
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const existing = await Appointment.findOne({
      doctor: doctor._id,
      date: appointmentDate,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "This slot has already been booked" });
    }

    const apptData = {
      user: req.user._id,
      doctor: doctor._id,
      date: appointmentDate,
      status: "confirmed",
      payment: paymentInfo,
    };

    const appt = new Appointment(apptData);
    await appt.save();
    await appt.populate("doctor");
    res.json(appt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.listForUser = async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user._id })
      .populate("doctor")
      .sort({ date: -1 });
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

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || !appt.doctor.equals(doctor._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    appt.status = status;
    await appt.save();
    await appt.populate("user", "name email phone profilePicture");
    res.json(appt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
