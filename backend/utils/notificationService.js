const Expo = require("expo-server-sdk").Expo;
const nodemailer = require("nodemailer");

const expo = new Expo();

const emailUser = process.env.EMAIL_USER || "noreply@sountabeeb.com";
const emailPassword = process.env.EMAIL_PASSWORD || "";
const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
const emailPort = Number(process.env.EMAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
  // --- NEW: Add timeout buffers to prevent random ETIMEDOUT drops ---
  connectionTimeout: 10000, // Wait 10 seconds before giving up
  greetingTimeout: 5000,
  socketTimeout: 20000,
  pool: true // Use pooled connections for better reliability
});
/**
 * Send push notification via Expo
 * @param {String} pushToken - User's expo push token
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {Object} data - Additional data to send
 */
exports.sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Invalid push token: ${pushToken}`);
      return { ok: false, message: "Invalid push token" };
    }

    const messages = [
      {
        to: pushToken,
        sound: "default",
        title,
        body,
        data,
        badge: 1,
        priority: "high",
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    let failedTokens = [];

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, index) => {
          if (ticket.status === "error") {
            console.error(`Notification error: ${ticket.message}`);
            if (
              ticket.details &&
              ticket.details.error === "DeviceNotRegistered"
            ) {
              failedTokens.push(pushToken);
            }
          }
        });
      } catch (err) {
        console.error("Error sending push notification chunk:", err);
      }
    }

    return {
      ok: true,
      message: "Push notification sent successfully",
      failedTokens,
    };
  } catch (err) {
    console.error("Push notification error:", err);
    return { ok: false, message: err.message };
  }
};

/**
 * Send multiple push notifications
 * @param {Array} pushTokens - Array of user push tokens
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {Object} data - Additional data
 */
exports.sendBulkPushNotifications = async (
  pushTokens,
  title,
  body,
  data = {},
) => {
  try {
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token),
    );

    if (validTokens.length === 0) {
      return { ok: false, message: "No valid push tokens" };
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data,
      badge: 1,
      priority: "high",
    }));

    const chunks = expo.chunkPushNotifications(messages);
    let sentCount = 0;
    let failedTokens = [];

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, index) => {
          if (ticket.status === "ok") {
            sentCount++;
          } else {
            console.error(`Notification error: ${ticket.message}`);
            failedTokens.push(validTokens[index]);
          }
        });
      } catch (err) {
        console.error("Error sending push notification chunk:", err);
      }
    }

    return {
      ok: true,
      message: `Sent ${sentCount} notifications successfully`,
      sent: sentCount,
      failedTokens,
    };
  } catch (err) {
    console.error("Bulk push notification error:", err);
    return { ok: false, message: err.message };
  }
};

/**
 * Send appointment confirmation email
 */
exports.sendAccountCreatedEmail = async (email, userName, role = "user") => {
  try {
    const title =
      role === "doctor" ? "Doctor Account Created" : "Account Created";
    const bodyIntro =
      role === "doctor"
        ? "Your doctor account has been successfully created."
        : "Your account has been successfully created.";

    const mailOptions = {
      from: emailUser,
      to: email,
      subject: `${title} - SounTabeeb`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">${title}</h2>
          <p>Hi ${userName},</p>
          <p>${bodyIntro}</p>
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Account Type:</strong> ${role === "doctor" ? "Doctor" : "Patient"}</p>
          </div>
          <p>Thank you for joining SounTabeeb. You can now log in and start using the service.</p>
          <p>Best regards,<br>SounTabeeb Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { ok: true, message: "Account created email sent successfully" };
  } catch (err) {
    console.error("Account created email error:", err);
    return { ok: false, message: err.message };
  }
};

exports.sendAppointmentConfirmationEmail = async (
  email,
  userName,
  doctorName,
  appointmentDate,
  timeSlot,
) => {
  try {
    const formattedDate = new Date(appointmentDate).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Appointment Confirmed - SounTabeeb",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Appointment Confirmed</h2>
          <p>Hi ${userName},</p>
          <p>Your appointment has been successfully booked. Here are the details:</p>
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${timeSlot}</p>
          </div>
          <p>Please arrive 5-10 minutes before your scheduled time.</p>
          <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
          <p>Best regards,<br>SounTabeeb Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { ok: true, message: "Confirmation email sent successfully" };
  } catch (err) {
    console.error("Appointment confirmation email error:", err);
    return { ok: false, message: err.message };
  }
};

/**
 * Send appointment reminder email
 */
exports.sendAppointmentReminderEmail = async (
  email,
  userName,
  doctorName,
  appointmentDate,
  timeSlot,
) => {
  try {
    const formattedDate = new Date(appointmentDate).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Reminder: Your Appointment Tomorrow - SounTabeeb",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Appointment Reminder</h2>
          <p>Hi ${userName},</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${timeSlot}</p>
          </div>
          <p>Please arrive 5-10 minutes early.</p>
          <p>If you need to reschedule or cancel, please do so as soon as possible.</p>
          <p>Best regards,<br>SounTabeeb Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { ok: true, message: "Reminder email sent successfully" };
  } catch (err) {
    console.error("Appointment reminder email error:", err);
    return { ok: false, message: err.message };
  }
};

/**
 * Send appointment cancellation email
 */
exports.sendAppointmentCancellationEmail = async (
  email,
  userName,
  doctorName,
  appointmentDate,
  timeSlot,
) => {
  try {
    const formattedDate = new Date(appointmentDate).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Appointment Cancelled - SounTabeeb",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Appointment Cancelled</h2>
          <p>Hi ${userName},</p>
          <p>Your appointment has been cancelled. Here are the details:</p>
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${timeSlot}</p>
          </div>
          <p>If you would like to book a new appointment, please visit our app.</p>
          <p>Best regards,<br>SounTabeeb Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { ok: true, message: "Cancellation email sent successfully" };
  } catch (err) {
    console.error("Appointment cancellation email error:", err);
    return { ok: false, message: err.message };
  }
};
