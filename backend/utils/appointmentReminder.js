const cron = require("node-cron");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const notificationService = require("./notificationService");

let reminderScheduler = null;

/**
 * Start appointment reminder scheduler
 * Runs every hour to check for appointments in the next 24 hours
 */
exports.startReminderScheduler = () => {
  // Run every hour at minute 0
  reminderScheduler = cron.schedule("0 * * * *", async () => {
    console.log("Running appointment reminder scheduler...");
    try {
      await sendAppointmentReminders();
    } catch (err) {
      console.error("Reminder scheduler error:", err);
    }
  });

  console.log("Appointment reminder scheduler started");
  return reminderScheduler;
};

/**
 * Stop the reminder scheduler
 */
exports.stopReminderScheduler = () => {
  if (reminderScheduler) {
    reminderScheduler.stop();
    reminderScheduler.destroy();
    reminderScheduler = null;
    console.log("Appointment reminder scheduler stopped");
  }
};

/**
 * Send appointment reminders for appointments in the next 24 hours
 */
const sendAppointmentReminders = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn(
        "Skipping appointment reminders because MongoDB is not connected.",
      );
      return;
    }

    // Calculate tomorrow's date range
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Find appointments scheduled for tomorrow
    const appointments = await Appointment.find({
      date: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: { $in: ["confirmed", "pending"] },
      reminderSent: { $ne: true },
    })
      .populate("user", "name email pushToken")
      .populate("doctor", "name");

    console.log(`Found ${appointments.length} appointments to remind`);

    for (const appointment of appointments) {
      try {
        const user = appointment.user;
        const doctor = appointment.doctor;

        if (!user) continue;

        // Send email reminder
        const emailResult =
          await notificationService.sendAppointmentReminderEmail(
            user.email,
            user.name,
            doctor.name,
            appointment.date,
            appointment.slot,
          );

        // Send push notification if user has push token
        let pushResult = { ok: true };
        if (user.pushToken) {
          pushResult = await notificationService.sendPushNotification(
            user.pushToken,
            "Appointment Reminder",
            `Your appointment with ${doctor.name} is tomorrow at ${appointment.slot}`,
            {
              appointmentId: appointment._id.toString(),
              type: "appointment_reminder",
            },
          );
        }

        // Mark reminder as sent
        if (emailResult.ok || pushResult.ok) {
          appointment.reminderSent = true;
          await appointment.save();
          console.log(`Reminder sent for appointment ${appointment._id}`);
        }
      } catch (err) {
        console.error(
          `Error sending reminder for appointment ${appointment._id}:`,
          err,
        );
      }
    }
  } catch (err) {
    console.error("Error in sendAppointmentReminders:", err);
  }
};

/**
 * Manually trigger appointment reminder (for testing or admin)
 */
exports.manuallyTriggerReminders = async () => {
  console.log("Manually triggering appointment reminders...");
  await sendAppointmentReminders();
};
