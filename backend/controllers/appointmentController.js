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

const parseTimeToMinutes = (time) => {
  if (!time || typeof time !== "string") return null;
  const parts = time.split(":").map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }
  const [hours, minutes] = parts;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const parseSlotStart = (slot) => {
  if (!slot || typeof slot !== "string") return null;
  const [start] = slot.split("-").map((part) => part.trim());
  return parseTimeToMinutes(start);
};

const isWithinWorkingHours = (doctor, appointmentDate, slot) => {
  if (!doctor || !Array.isArray(doctor.workingHours)) return true;

  const dayName = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const schedule = doctor.workingHours.find((hour) => hour.day === dayName);

  if (!schedule) return false;
  if (!schedule.active) return false;

  const slotStart = parseSlotStart(slot);
  const workStart = parseTimeToMinutes(schedule.start);
  const workEnd = parseTimeToMinutes(schedule.end);

  if (slotStart === null || workStart === null || workEnd === null) return true;

  return slotStart >= workStart && slotStart < workEnd;
};

const isOnLeave = (doctor, appointmentDate) => {
  if (!doctor || !Array.isArray(doctor.leaves)) return false;
  return doctor.leaves.some((leave) => {
    if (!leave?.from || !leave?.to) return false;
    const from = new Date(leave.from);
    const to = new Date(leave.to);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return appointmentDate >= from && appointmentDate <= to;
  });
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

    if (!isWithinWorkingHours(doctor, appointmentDate, slot)) {
      return res.status(400).json({
        message:
          "The doctor is not available at this time. Please choose a slot within their working schedule.",
      });
    }

    if (isOnLeave(doctor, appointmentDate)) {
      return res.status(400).json({
        message:
          "The doctor is on leave on this date. Please select another day.",
      });
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

    if (!isWithinWorkingHours(doctor, appointmentDate, slot)) {
      return res.status(400).json({
        message:
          "The doctor is not available at this time. Please choose a slot within their working schedule.",
      });
    }

    if (isOnLeave(doctor, appointmentDate)) {
      return res.status(400).json({
        message:
          "The doctor is on leave on this date. Please select another day.",
      });
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
