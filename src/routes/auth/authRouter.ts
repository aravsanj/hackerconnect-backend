import express from "express";
import {
  Login,
  Register,
  updatePassword,
  Logout,
  validateUsername,
  verifyOTP,
  verifyEmail,
  validatePhone,
  validateEmail,
  sendOTPtoPhone,
  sendConfirmationLink,
} from "../../controllers/authControllers.js";
import generateResetLink from "../../middleware/passwordReset.js";
import sendOTP from "../../middleware/sendOTP.js";

const authRouter = express.Router();

authRouter.post("/register", sendOTP, Register);

authRouter.post("/login", Login);

authRouter.post("/sendOTP", sendOTPtoPhone)

authRouter.post("/verifyOTP", verifyOTP);

authRouter.post("/forgotPassword", generateResetLink);

authRouter.post("/newPassword", updatePassword);

authRouter.post("/validateUsername", validateUsername);

authRouter.post("/validatePhone", validatePhone);

authRouter.post("/validateEmail", validateEmail);

authRouter.post("/sendConfirmationLink", sendConfirmationLink);

authRouter.post("/verifyEmail", verifyEmail);

authRouter.post("/logout", Logout);

export default authRouter;
