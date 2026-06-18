const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
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

const addInAppNotification = async (userId, title, body, data = {}) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          title,
          body,
          type: data.type || "appointment",
          data,
          read: false,
          createdAt: new Date(),
        },
      },
    });
  } catch (err) {
    console.error("In-app notification error:", err);
  }
};

const sendAppointmentRequestedNotifications = async (
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
        "Appointment Requested",
        `Your appointment request for ${slot} is pending doctor's approval.`,
        {
          appointmentId: appt._id.toString(),
          type: "appointment_requested",
        },
      )
      .catch((err) => console.error("Confirmation push error:", err));
  }

  if (doctor && doctor.user) {
    addInAppNotification(
      doctor.user,
      "New Appointment Request",
      `${user.name} has requested an appointment for ${slot}.`,
      {
        appointmentId: appt._id.toString(),
        type: "appointment_request",
      },
    );
  }
};

const sendAppointmentStatusUpdate = async (appt, oldStatus, status) => {
  if (!appt.user) return;
  const title = `Appointment ${status}`;
  const body = `Your appointment status changed from ${oldStatus} to ${status}.`;
  await addInAppNotification(appt.user._id, title, body, {
    appointmentId: appt._id.toString(),
    type: `appointment_${status}`,
  });

  if (appt.user.pushToken) {
    notificationService
      .sendPushNotification(appt.user.pushToken, title, body, {
        appointmentId: appt._id.toString(),
        type: `appointment_${status}`,
      })
      .catch((err) =>
        console.error("Status update push notification error:", err),
      );
  }
};

const sendAppointmentReminderInApp = async (user, doctor, appointment) => {
  if (!user) return;
  const title = "Appointment Reminder";
  const body = `Your appointment with ${doctor.name} is tomorrow at ${appointment.slot}.`;

  await addInAppNotification(user._id, title, body, {
    appointmentId: appointment._id.toString(),
    type: "appointment_reminder",
  });

  if (user.pushToken) {
    notificationService
      .sendPushNotification(user.pushToken, title, body, {
        appointmentId: appointment._id.toString(),
        type: "appointment_reminder",
      })
      .catch((err) => console.error("Reminder push error:", err));
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
      status: "pending",
      approval: {
        status: "pending",
      },
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
      await sendAppointmentRequestedNotifications(
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
      status: "pending",
      approval: {
        status: "pending",
      },
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
      await sendAppointmentRequestedNotifications(
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

exports.requestReschedule = async (req, res) => {
  try {
    const { newDate, newSlot, reason } = req.body;
    if (!newDate || !newSlot) {
      return res
        .status(400)
        .json({ message: "New date and slot are required" });
    }

    const appt = await Appointment.findById(req.params.id)
      .populate("doctor")
      .populate("user", "name email phone profilePicture pushToken");
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const isRequesterDoctor = req.user.role === "doctor";
    if (!appt.user.equals(req.user._id) && !isRequesterDoctor) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (["cancelled", "completed"].includes(appt.status)) {
      return res
        .status(400)
        .json({
          message: "Cannot reschedule a completed or cancelled appointment",
        });
    }

    const appointmentDate = normalizeAppointmentDate(newDate);
    if (!appointmentDate) {
      return res.status(400).json({ message: "Invalid new appointment date" });
    }

    const doctor = await findDoctor(appt.doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!isWithinWorkingHours(doctor, appointmentDate, newSlot)) {
      return res
        .status(400)
        .json({ message: "The doctor is not available at this new slot." });
    }

    const existing = await Appointment.findOne({
      doctor: doctor._id,
      date: appointmentDate,
      slot: newSlot,
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: appt._id },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "This slot has already been booked" });
    }

    appt.rescheduleRequest = {
      requestedBy: isRequesterDoctor ? "doctor" : "user",
      requestedDate: appointmentDate,
      requestedSlot: newSlot,
      reason: reason || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await appt.save();

    const subject = isRequesterDoctor
      ? "Doctor Requested Reschedule"
      : "Reschedule Request Submitted";
    const patientBody = isRequesterDoctor
      ? `Your doctor has requested to reschedule your appointment to ${newSlot}.`
      : `Your reschedule request for ${newSlot} has been sent to the doctor.`;
    const doctorBody = isRequesterDoctor
      ? `You requested a reschedule for ${appt.user.name}.`
      : `${appt.user.name} requested a reschedule to ${newSlot}.`;

    if (appt.user) {
      await addInAppNotification(appt.user._id, subject, patientBody, {
        appointmentId: appt._id.toString(),
        type: "appointment_reschedule",
      });
    }

    if (appt.doctor && appt.doctor.user) {
      await addInAppNotification(appt.doctor.user, subject, doctorBody, {
        appointmentId: appt._id.toString(),
        type: "appointment_reschedule",
      });
    }

    return res.json(appt);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send("Server error");
  }
};

exports.respondRescheduleRequest = async (req, res) => {
  try {
    const { decision, doctorNotes } = req.body;
    if (
      !decision ||
      !["approved", "rejected", "cancelled"].includes(decision)
    ) {
      return res.status(400).json({ message: "Invalid reschedule decision" });
    }

    const appt = await Appointment.findById(req.params.id)
      .populate("doctor")
      .populate("user", "name email phone profilePicture pushToken");
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || !appt.doctor.equals(doctor._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (
      !appt.rescheduleRequest ||
      appt.rescheduleRequest.status !== "pending"
    ) {
      return res.status(400).json({ message: "No pending reschedule request" });
    }

    appt.rescheduleRequest.status = decision;
    appt.rescheduleRequest.updatedAt = new Date();

    if (decision === "approved") {
      appt.date = appt.rescheduleRequest.requestedDate;
      appt.slot = appt.rescheduleRequest.requestedSlot;
      appt.status = "confirmed";
      appt.reminderSent = false;
    }

    appt.approval = {
      ...appt.approval,
      doctorNotes: doctorNotes || appt.approval.doctorNotes,
      updatedAt: new Date(),
    };

    await appt.save();

    const action = decision === "approved" ? "approved" : "declined";
    const title = `Reschedule ${action}`;
    const body =
      decision === "approved"
        ? `Your appointment reschedule request has been approved to ${appt.slot}.`
        : `Your reschedule request was declined.`;

    if (appt.user) {
      await addInAppNotification(appt.user._id, title, body, {
        appointmentId: appt._id.toString(),
        type: "appointment_reschedule_response",
      });
    }

    return res.json(appt);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send("Server error");
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate("doctor", "name speciality")
      .populate("appointment", "date slot status")
      .sort({ createdAt: -1 });

    return res.json(transactions);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.recordPaymentStatus = async (req, res) => {
  try {
    const { transactionRef, status, failureReason } = req.body;

    if (!transactionRef || !status) {
      return res
        .status(400)
        .json({ message: "Transaction ref and status required" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { transactionRef, user: req.user._id },
      {
        status,
        failureReason: failureReason || null,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json(transaction);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

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
    const { status, doctorNotes } = req.body;
    const allowed = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "rejected",
    ];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findById(req.params.id)
      .populate("doctor")
      .populate("user", "name email phone profilePicture pushToken");
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || !appt.doctor.equals(doctor._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const oldStatus = appt.status;
    appt.status = status;
    appt.approval = {
      ...appt.approval,
      status:
        status === "confirmed"
          ? "approved"
          : status === "rejected"
            ? "rejected"
            : appt.approval.status,
      doctorNotes: doctorNotes || appt.approval.doctorNotes,
      updatedAt: new Date(),
    };
    if (oldStatus === "cancelled" && status === "confirmed") {
      appt.reminderSent = false;
    }

    await appt.save();

    if (oldStatus !== status) {
      await sendAppointmentStatusUpdate(appt, oldStatus, status);
    }

    return res.json(appt);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};
