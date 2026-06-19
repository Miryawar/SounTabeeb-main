const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const crypto = require("crypto");
const {
  sendPasswordResetEmail,
  sendVerificationEmail,
} = require("../utils/emailClient");
const notificationService = require("../utils/notificationService");

const EMAIL_CODE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const PHONE_CODE_TTL_MS = 1000 * 60 * 10; // 10min

const PendingUser = require("../models/PendingUser");

// Start registration: create a PendingUser and send tokens. Account not created yet.
exports.register = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    profilePicture,
    bio,
    speciality,
    qualification,
    experience,
    licenseNumber,
  } = req.body;
  try {
    if (!email || !phone || !password || !name)
      return res
        .status(400)
        .json({ message: "name,email,phone,password required" });

    // Ensure no existing user
    let existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    // Check for pending registration - if exists, update it with new codes
    let pending = await PendingUser.findOne({ $or: [{ email }, { phone }] });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const emailCode = String(Math.floor(100000 + Math.random() * 900000));
    const phoneCode = String(Math.floor(100000 + Math.random() * 900000));

    if (pending) {
      // Update existing pending registration with new credentials and codes
      pending.name = name;
      pending.passwordHash = hashed;
      pending.emailVerificationCode = emailCode;
      pending.emailVerificationExpires = new Date(
        Date.now() + EMAIL_CODE_TTL_MS,
      );
      pending.phoneVerificationCode = phoneCode;
      pending.phoneVerificationExpires = new Date(
        Date.now() + PHONE_CODE_TTL_MS,
      );
      await pending.save();

      // Send verification email
      const emailResult = await sendVerificationEmail(email, emailCode);

      if (!emailResult.ok) {
        return res.status(500).json({
          message: "Failed to send verification email",
          error: emailResult.message,
        });
      }

      // Return pending ID so frontend can route to verify
      return res.json({
        pendingId: pending._id,
        message: "Verification code sent",
        // verification: { emailCode, phoneCode },
      });
    }

    const pendingData = {
      name,
      email,
      phone,
      passwordHash: hashed,
      role: role || "user",
      profilePicture,
      bio,
      speciality,
      qualification,
      experience,
      licenseNumber,
      emailVerificationCode: emailCode,
      emailVerificationExpires: new Date(Date.now() + EMAIL_CODE_TTL_MS),
      phoneVerificationCode: phoneCode,
      phoneVerificationExpires: new Date(Date.now() + PHONE_CODE_TTL_MS),
    };

    pending = new PendingUser(pendingData);
    await pending.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, emailCode);

    if (!emailResult.ok) {
      await PendingUser.findByIdAndDelete(pending._id);

      return res.status(500).json({
        message: "Failed to send verification email",
        error: emailResult.message,
      });
    }

    // return pending id for verification process
    return res.json({
      pendingId: pending._id,
      message: "Verification email sent",
    });
  } catch (err) {
    console.error("REGISTER INIT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        dob: user.dob || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        district: user.district || "",
        pincode: user.pincode || "",
        gender: user.gender || "",
        role: user.role || "user",
        profilePicture: doctorProfile?.profilePicture || "",
        bio: doctorProfile?.bio || "",
        speciality: doctorProfile?.speciality || "",
        qualification: doctorProfile?.qualification || "",
        experience: doctorProfile?.experience || "",
        licenseNumber: doctorProfile?.licenseNumber || "",
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// send email verification code
exports.sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email required" });
    // support pending or existing user
    let target = await PendingUser.findOne({ email });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    if (target) {
      target.emailVerificationCode = code;
      target.emailVerificationExpires = new Date(
        Date.now() + EMAIL_CODE_TTL_MS,
      );
      await target.save();
      await sendVerificationEmail(email, code);
      return res.json({
        message: "Verification code sent to pending registration email",
      });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(Date.now() + EMAIL_CODE_TTL_MS);
    await user.save();
    await sendVerificationEmail(email, code);
    res.json({ message: "Verification code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "email and code required" });
    // try existing user first
    let user = await User.findOne({ email });
    if (user) {
      if (
        !user.emailVerificationCode ||
        user.emailVerificationCode !== String(code)
      )
        return res.status(400).json({ message: "Invalid code" });
      if (
        user.emailVerificationExpires &&
        user.emailVerificationExpires < new Date()
      )
        return res.status(400).json({ message: "Code expired" });
      user.emailVerified = true;
      user.emailVerificationCode = null;
      user.emailVerificationExpires = null;
      await user.save();
      return res.json({ message: "Email verified" });
    }
    // try pending registration
    const pending = await PendingUser.findOne({ email });
    if (!pending) return res.status(404).json({ message: "User not found" });
    if (
      !pending.emailVerificationCode ||
      pending.emailVerificationCode !== String(code)
    )
      return res.status(400).json({ message: "Invalid code" });
    if (
      pending.emailVerificationExpires &&
      pending.emailVerificationExpires < new Date()
    )
      return res.status(400).json({ message: "Code expired" });
    // clear code on pending (client can call complete-register with pendingId)
    // pending.emailVerificationCode = null;
    // pending.emailVerificationExpires = null;
    pending.emailVerified = true;
    await pending.save();

    console.log("EMAIL VERIFIED");
    console.log("pendingId:", pending._id);
    console.log("emailVerified:", pending.emailVerified);

    return res.json({
      message: "Email verified for pending registration",
      emailVerified: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message:
          "If an account exists for that email, a reset link has been sent.",
      });
    }

    // const token = crypto.randomBytes(24).toString("hex");
    // user.resetPasswordToken = token;
    // user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60); // 1h
    // await user.save();

    // const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    // const emailResult = await sendPasswordResetEmail(email, token, baseUrl);

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    const emailResult = await sendVerificationEmail(email, otp);

    if (!emailResult.ok) {
      console.warn("Email send failed:", emailResult.message);
      return res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
      });
    }

    return res.json({});
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.resetOtp !== String(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpires && user.resetOtpExpires < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    return res.json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("VERIFY RESET OTP ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// exports.resetPassword = async (req, res) => {
//   try {
//     const { token, password } = req.body;
//     if (!token || !password)
//       return res
//         .status(400)
//         .json({ message: "Token and new password are required" });

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: new Date() },
//     });
//     if (!user)
//       return res.status(400).json({ message: "Invalid or expired token" });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);
//     user.resetPasswordToken = null;
//     user.resetPasswordExpires = null;
//     await user.save();

//     res.json({ message: "Password reset successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    user.resetOtp = null;
    user.resetOtpExpires = null;

    await user.save();

    return res.json({
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.sendPhoneCode = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "phone required" });
    // support pending or existing user
    let target = await PendingUser.findOne({ phone });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    if (target) {
      target.phoneVerificationCode = code;
      target.phoneVerificationExpires = new Date(
        Date.now() + PHONE_CODE_TTL_MS,
      );
      await target.save();
      return res.json({
        message: "Phone code generated for pending registration",
        code,
      });
    }
    // optionally validate phone format
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.phoneVerificationCode = code;
    user.phoneVerificationExpires = new Date(Date.now() + PHONE_CODE_TTL_MS);
    await user.save();
    // in prod: send SMS. Here return code for testing.
    res.json({ message: "Phone code generated", code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code)
      return res.status(400).json({ message: "phone and code required" });
    // try existing user first
    let user = await User.findOne({ phone });
    if (user) {
      if (
        !user.phoneVerificationCode ||
        user.phoneVerificationCode !== String(code)
      )
        return res.status(400).json({ message: "Invalid code" });
      if (
        user.phoneVerificationExpires &&
        user.phoneVerificationExpires < new Date()
      )
        return res.status(400).json({ message: "Code expired" });
      user.phoneVerified = true;
      user.phoneVerificationCode = null;
      user.phoneVerificationExpires = null;
      await user.save();
      return res.json({ message: "Phone verified" });
    }
    // try pending
    const pending = await PendingUser.findOne({ phone });
    if (!pending) return res.status(404).json({ message: "User not found" });
    if (
      !pending.phoneVerificationCode ||
      pending.phoneVerificationCode !== String(code)
    )
      return res.status(400).json({ message: "Invalid code" });
    if (
      pending.phoneVerificationExpires &&
      pending.phoneVerificationExpires < new Date()
    )
      return res.status(400).json({ message: "Code expired" });
    // pending.phoneVerificationCode = null;
    // pending.phoneVerificationExpires = null;
    pending.phoneVerified = true;
    await pending.save();
    res.json({ message: "Phone verified for pending registration" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Complete registration: verify tokens from pending and create actual User
exports.completeRegister = async (req, res) => {
  try {
    const { pendingId } = req.body;
    if (!pendingId)
      return res.status(400).json({ message: "pendingId required" });
    const pending = await PendingUser.findById(pendingId);
    console.log("COMPLETE REGISTER");
    console.log("pendingId:", pendingId);
    console.log("pending.emailVerified:", pending.emailVerified);
    console.log("pending.email:", pending.email);
    if (!pending)
      return res
        .status(404)
        .json({ message: "Pending registration not found" });
    if (!pending.emailVerified) {
      return res.status(400).json({
        message: "Please verify your email before continuing",
      });
    }

    // check codes (either emailCode or phoneCode must match)
    // if (emailCode) {
    //   if (pending.emailVerificationCode !== String(emailCode))
    //     return res.status(400).json({ message: "Invalid email code" });
    //   if (
    //     pending.emailVerificationExpires &&
    //     pending.emailVerificationExpires < new Date()
    //   )
    //     return res.status(400).json({ message: "Email code expired" });
    // }
    if (!pending.emailVerified) {
      return res.status(400).json({
        message: "Email not verified",
      });
    }
    // if (phoneCode) {
    //   if (pending.phoneVerificationCode !== String(phoneCode))
    //     return res.status(400).json({ message: "Invalid phone code" });
    //   if (
    //     pending.phoneVerificationExpires &&
    //     pending.phoneVerificationExpires < new Date()
    //   )
    //     return res.status(400).json({ message: "Phone code expired" });
    // }
    // if (!pending.emailVerified || !pending.phoneVerified) {
    //   return res.status(400).json({
    //     message: "Complete all verifications",
    //   });
    // }
    // Create actual User
    // Ensure no race with existing users
    const existing = await User.findOne({
      $or: [{ email: pending.email }, { phone: pending.phone }],
    });
    if (existing) {
      // cleanup pending
      await PendingUser.findByIdAndDelete(pending._id);
      return res.status(400).json({ message: "User already exists" });
    }

    const userData = {
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      password: pending.passwordHash,
      role: pending.role || "user",
      emailVerified: pending.emailVerified,
      // phoneVerified: pending.phoneVerified,
    };

    const user = new User(userData);
    await user.save();

    let doctorProfile = null;
    if (pending.role === "doctor") {
      const doctorData = {
        user: user._id,
        name: pending.name,
        email: pending.email,
        profilePicture: pending.profilePicture || "",
        bio: pending.bio || "",
        speciality: pending.speciality || "",
        qualification: pending.qualification || "",
        experience: pending.experience || "",
        licenseNumber: pending.licenseNumber || "",
      };
      doctorProfile = await Doctor.create(doctorData);
      user.doctor = doctorProfile._id;
      await user.save();
    }

    // send welcome email after account creation, but do not block response on failure
    notificationService
      .sendAccountCreatedEmail(user.email, user.name, user.role)
      .catch((err) => console.error("Account creation email error:", err));

    // remove pending
    await PendingUser.findByIdAndDelete(pending._id);

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("COMPLETE REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
