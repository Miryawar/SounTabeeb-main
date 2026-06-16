const nodemailer = require("nodemailer");

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
});
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY ERROR:", error.message);
  } else {
    console.log("SMTP READY");
  }
});

exports.sendPasswordResetEmail = async (email, resetToken, baseUrl) => {
  try {
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Password Reset - Soun Tabeeb",
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested a password reset for your Soun Tabeeb account.</p>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { ok: true, message: "Email sent successfully" };
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    return { ok: false, message: err.message };
  }
};

exports.sendVerificationEmail = async (email, verificationCode) => {
  try {
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Email Verification - Soun Tabeeb",
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 5px; font-size: 32px;">${verificationCode}</h1>
        <p>This code is valid for 24 hours.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { ok: true, message: "Verification email sent" };
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    return { ok: false, message: err.message };
  }
};
