export const validateEmail = (email: string) => {
  const emailRegex = /\S+@\S+\.\S+/;

  if (!email) {
    return {
      valid: false,
      message: "Please enter your email",
    };
  }

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: "Please enter a valid email address",
    };
  }

  return {
    valid: true,
    message: "",
  };
};
export const validatePassword = (password: string) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!password) {
    return {
      valid: false,
      message: "Please enter your password",
    };
  }

  if (!passwordRegex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 6 characters and include at least one letter and one number",
    };
  }

  return {
    valid: true,
    message: "",
  };
};