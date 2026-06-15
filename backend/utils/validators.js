const { body, param, query, validationResult } = require("express-validator");

// Validation Middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth Validators
const validateSignUp = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/)
    .withMessage("Please provide a valid phone number"),
];

const validateSignIn = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateForgotPassword = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

const validateResetPassword = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

// User Validators
const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/)
    .withMessage("Please provide a valid phone number"),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Address must be at least 3 characters"),
];

// Doctor Validators
const validateCreateDoctor = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),
  body("phone")
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/)
    .withMessage("Please provide a valid phone number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateUpdateDoctor = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("specialization")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Specialization cannot be empty"),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience must be a non-negative number"),
  body("fees")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fees must be a non-negative number"),
];

// Appointment Validators
const validateCreateAppointment = [
  body("doctorId").trim().notEmpty().withMessage("Doctor ID is required"),
  body("appointmentDate")
    .isISO8601()
    .withMessage("Please provide a valid date (ISO 8601 format)"),
  body("timeSlot")
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please provide a valid time slot (HH:MM format)"),
  body("reason")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Reason must be at least 3 characters"),
];

// Chat Validators
const validateSendMessage = [
  body("message")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Message must be between 1 and 5000 characters"),
  body("receiverId").trim().notEmpty().withMessage("Receiver ID is required"),
];

// AI Chat Validators
const validateAIChat = [
  body("message")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Message must be between 1 and 5000 characters"),
];

// ID Validators
const validateObjectId = [
  param("id")
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage("Invalid ID format"),
];

const validateCategoryParam = [
  param("category").trim().notEmpty().withMessage("Category is required"),
];

// Search/Query Validators
const validateDoctorSearch = [
  query("specialization").optional().trim(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

module.exports = {
  validate,
  validateSignUp,
  validateSignIn,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateCreateDoctor,
  validateUpdateDoctor,
  validateCreateAppointment,
  validateSendMessage,
  validateAIChat,
  validateObjectId,
  validateCategoryParam,
  validateDoctorSearch,
};
