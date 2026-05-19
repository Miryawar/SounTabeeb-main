 // EMAIL VALIDATION
export const validateEmail = (email: string) => {
  const emailRegex = /\S+@\S+\.\S+/;

  if (!email || email.trim() === "") {
    return { valid: false, message: "Email is required" };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Enter a valid email address" };
  }

  return { valid: true, message: "" };
};

// PASSWORD VALIDATION
export const validatePassword = (password: string) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters",
    };
  }

  if (!passwordRegex.test(password)) {
    return {
      valid: false,
      message: "Password must contain letters and numbers",
    };
  }

  return { valid: true, message: "" };
};

// NAME VALIDATION
export const validateName = (name: string) => {
  if (!name || name.trim() === "") {
    return { valid: false, message: "Name is required" };
  }

  if (name.trim().length < 3) {
    return { valid: false, message: "Name must be at least 3 characters" };
  }

  return { valid: true, message: "" };
};

// PHONE VALIDATION
export const validatePhone = (phone: string) => {
  const phoneRegex = /^[0-9]{10}$/;

  if (!phone) {
    return { valid: false, message: "Phone number is required" };
  }

  if (!phoneRegex.test(phone)) {
    return { valid: false, message: "Enter a valid 10-digit phone number" };
  }

  return { valid: true, message: "" };
};