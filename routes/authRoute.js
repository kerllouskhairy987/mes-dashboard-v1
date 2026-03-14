const express = require("express");
const {
  createUserValidator,
  loginValidator,
  resetPasswordValidator,
} = require("../utils/validators/userValidator");
const {
  signup,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require("../services/authService");

const router = express.Router();

router.post("/signup", createUserValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyPasswordResetCode);
router.put("/reset-password", resetPasswordValidator, resetPassword);

module.exports = router;
