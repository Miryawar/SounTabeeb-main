const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const notificationService = require("../utils/notificationService");
const paymentService = require("../utils/paymentService");

const normalizeAppointmentDate = (dateString) => {
  const appointmentDate = new Date(dateString);
  if (Number.isNaN(appointmentDate.getTime())) {
    return null;
  }
  appointmentDate.setHours(0, 0, 0, 0);
  return appointmentDate;
};

const findDoctor = async (doctorId) => {
  let doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    doctor = await Doctor.findOne({ user: doctorId });
  }
  return doctor;
};

const sendAppointmentConfirmedNotifications = async (
  user,
  doctor,
  appointmentDate,
  slot,
  appt,
) => {
  notificationService
    .sendAppointmentConfirmationEmail(
      user.email,
      user.name,
      doctor.name,
      appointmentDate,
      slot,
    )
    .catch((err) => console.error("Confirmation email error:", err));

  if (user.pushToken) {
    notificationService
      .sendPushNotification(
        user.pushToken,
        "Appointment Confirmed",
        `Your appointment with ${doctor.name} is confirmed for ${slot}`,
        {
          appointmentId: appt._id.toString(),
          type: "appointment_confirmed",
        },
      )
      .catch((err) => console.error("Confirmation push error:", err));
  }
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const { order, amount, currency } =
      await paymentService.createRazorpayOrder(doctorId);

    return res.json({ order, amount, currency });
  } catch (err) {
    console.error("Razorpay order creation error:", err.message || err);
    return res.status(err.status || 500).json({
      message: err.message || "Failed to create Razorpay order",
    });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, doctorId, date, slot } = req.body;

    if (!orderId || !paymentId || !signature || !doctorId || !date || !slot) {
      return res.status(400).json({
        message:
          "orderId, paymentId, signature, doctorId, date and slot are required",
      });
    }

    const valid = paymentService.verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!valid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const info = await paymentService.fetchOrder(orderId);
    if (!info || info.status !== "paid") {
      return res.status(400).json({
        message: "Razorpay order is not paid yet",
        orderStatus: info ? info.status : undefined,
      });
    }

    const appointmentDate = normalizeAppointmentDate(date);
    if (!appointmentDate) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    const doctor = await findDoctor(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const existing = await Appointment.findOne({
      doctor: doctor._id,
      date: appointmentDate,
      slot,
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
      slot,
      status: "confirmed",
      payment: {
        method: "razorpay",
        orderId,
        paymentId,
        signature,
        amount: info.amount / 100,
        currency: info.currency,
      },
    };

    const appt = new Appointment(apptData);
    try {
      await appt.save();
    } catch (saveErr) {
      if (saveErr && saveErr.code === 11000) {
        return res
          .status(400)
          .json({ message: "This slot has already been booked" });
      }
      throw saveErr;
    }

    await appt.populate("doctor");
    const user = await User.findById(req.user._id);
    if (user) {
      await sendAppointmentConfirmedNotifications(
        user,
        doctor,
        appointmentDate,
        slot,
        appt,
      );
    }

    return res.json(appt);
  } catch (err) {
    console.error("Razorpay verification error:", err.message || err);
    return res.status(err.status || 500).json({
      message: err.message || "Failed to verify Razorpay payment",
    });
  }
};

exports.create = async (req, res) => {
  const { doctorId, date, slot, paymentInfo } = req.body;

  try {
    if (!doctorId || !date || !slot) {
      return res
        .status(400)
        .json({ message: "Doctor, date and slot are required" });
    }

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

    const appointmentDate = normalizeAppointmentDate(date);
    if (!appointmentDate) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    const doctor = await findDoctor(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const existing = await Appointment.findOne({
      doctor: doctor._id,
      date: appointmentDate,
      slot,
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
      slot,
      status: "confirmed",
      payment: paymentInfo,
    };

    const appt = new Appointment(apptData);
    try {
      await appt.save();
    } catch (saveErr) {
      if (saveErr && saveErr.code === 11000) {
        return res
          .status(400)
          .json({ message: "This slot has already been booked" });
      }
      throw saveErr;
    }

    await appt.populate("doctor");
    const user = await User.findById(req.user._id);
    if (user) {
      await sendAppointmentConfirmedNotifications(
        user,
        doctor,
        appointmentDate,
        slot,
        appt,
      );
    }

    return res.json(appt);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

exports.listForUser = async (req, res) => {
  try {
    const appts = await Appointment.find({ user: req.user._id })
      .populate("doctor")
      .sort({ date: -1 });

    return res.json(appts);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

exports.cancel = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate("doctor");
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (!appt.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const user = await User.findById(req.user._id);
    const oldStatus = appt.status;

    appt.status = "cancelled";
    await appt.save();

    if (user && oldStatus !== "cancelled") {
      notificationService
        .sendAppointmentCancellationEmail(
          user.email,
          user.name,
          appt.doctor.name,
          appt.date,
          appt.slot,
        )
        .catch((err) => console.error("Cancellation email error:", err));

      if (user.pushToken) {
        notificationService
          .sendPushNotification(
            user.pushToken,
            "Appointment Cancelled",
            `Your appointment with ${appt.doctor.name} has been cancelled`,
            {
              appointmentId: appt._id.toString(),
              type: "appointment_cancelled",
            },
          )
          .catch((err) => console.error("Cancellation push error:", err));
      }
    }

    return res.json(appt);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findById(req.params.id).populate("doctor");
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || !appt.doctor.equals(doctor._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const oldStatus = appt.status;
    appt.status = status;
    if (oldStatus === "cancelled" && status === "confirmed") {
      appt.reminderSent = false;
    }

    await appt.save();
    await appt.populate("user", "name email phone profilePicture pushToken");

    if (oldStatus !== status && appt.user.pushToken) {
      const title = "Appointment Updated";
      const body = `Your appointment status changed to ${status}`;
      notificationService
        .sendPushNotification(appt.user.pushToken, title, body, {
          appointmentId: appt._id.toString(),
          type: `appointment_${status}`,
        })
        .catch((err) =>
          console.error("Status update push notification error:", err),
        );
    }

    return res.json(appt);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};
