const Razorpay = require("razorpay");
const crypto = require("crypto");
const Doctor = require("../models/Doctor");

const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const err = new Error(
      "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables",
    );
    err.status = 500;
    throw err;
  }

  return new Razorpay({ key_id, key_secret });
};

exports.createRazorpayOrder = async (doctorId, currency = "INR") => {
  const doctor = await Doctor.findById(doctorId).select("fees name");
  if (!doctor) {
    const err = new Error("Doctor not found");
    err.status = 404;
    throw err;
  }

  if (!doctor.fees || doctor.fees <= 0) {
    const err = new Error("Invalid consultation fee");
    err.status = 400;
    throw err;
  }

  const amount = Math.round(Number(doctor.fees) * 100);
  const receipt = `consultation_${doctorId}_${Date.now()}`;

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
    payment_capture: 1,
    notes: {
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
    },
  });

  return { order, amount, currency };
};

exports.verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};

exports.fetchOrder = async (orderId) => {
  const razorpay = getRazorpayClient();
  return razorpay.orders.fetch(orderId);
};
