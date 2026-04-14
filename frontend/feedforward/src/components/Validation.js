export const validateRegistration = (data) => {
  const errors = {};

  if (!data.username || data.username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
};