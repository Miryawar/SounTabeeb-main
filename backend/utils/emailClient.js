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
  requireTLS: emailPort === 587,
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 20000),
  greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 20000),
});
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY ERROR:", error.message);
  } else {
    console.log("SMTP READY");
  }
});

exports.sendPasswordResetEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Password Reset Request - Soun Tabeeb",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Password Reset Request</h2>
          <p>You have requested a password reset for your Soun Tabeeb account.</p>
          <p>Your password reset code is:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px; color: #2E86DE;">${otp}</h1>
          <p style="color: #904741; font-weight: bold; margin-top: 15px;">
            ⚠️ This code is valid for 10 minutes.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If you didn't request this, please safely ignore this email.
          </p>
        </div>
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
        <h1 style="letter-spacing: 5px; font-size: 32px; color: #2E86DE;">${verificationCode}</h1>
        <p style="color: #953f39; font-weight: bold; margin-top: 15px;">
        ⚠️ This code is valid for 10 minutes.
      </p>
      
      `,
    };

    await transporter.sendMail(mailOptions);
    return { ok: true, message: "Verification email sent" };
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    return { ok: false, message: err.message };
  }
};
