import express from "express";
import { Login, Register, updatePassword, Logout, validateUsername } from "../../controllers/authControllers.js";
import generateResetLink from "../../middleware/passwordReset.js";

const authRouter = express.Router();

authRouter.post("/register", Register);

authRouter.post("/login", Login);

authRouter.post("/forgotPassword", generateResetLink);

authRouter.post("/newPassword", updatePassword)

authRouter.post("/validateUsername", validateUsername)

authRouter.post("/logout", Logout)


export default authRouter;
