import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/jwt.js";
import OTPModel from "../models/OTP.js";
import {
  LoginDTO,
  RegisterDTO,
  UpdatePasswordDTO,
  ValidateUsernameDTO,
  VerifyOTPDTO,
  validateEmailDTO,
  validatePhoneDTO,
} from "../DTOs/authDTOs.js";
import generateConfirmLink from "../middleware/generateConfirmLink.js";
import mongoose from "mongoose";

type userData = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  username: string;
  hashedPassword: string;
  phone: string;
};

const Register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      username,
      password,
      phone,
    }: RegisterDTO = req.body;

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData: userData = {
      firstName,
      lastName,
      dateOfBirth,
      email,
      username,
      hashedPassword,
      phone,
    };

    const newUser = new User(userData);

    await newUser.save();
    res
      .status(201)
      .json({ message: "Verify phone", phone: phone, email: email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const Login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginDTO = req.body;

    const user = await User.findOne(
      { username: username },
      {
        hashedPassword: 1,
        username: 1,
        email: 1,
        isOTPVerified: 1,
        isEmailVerified: 1,
        phone: 1,
      }
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    if (!user.isOTPVerified || !user.isEmailVerified) {
      await User.deleteOne({ username: username });

      return res.status(202).json({
        isVerified: false,
        message: "Account unverified, please re-register",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      SECRET
    );

    return res
      .cookie("access-token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: "ok", isVerified: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updatePassword = async (req: Request, res: Response) => {
  try {
    const { password, _id }: UpdatePasswordDTO = req.body;

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.findOneAndUpdate(
      {
        _id: _id,
      },
      {
        hashedPassword,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const validateUsername = async (req: Request, res: Response) => {
  try {
    const { username }: ValidateUsernameDTO = req.body;

    const user = await User.findOne({ username: username });

    if (user) {
      res
        .status(200)
        .json({ message: "Username already exists", alreadyExists: true });
    } else {
      res
        .status(200)
        .json({ message: "Username is available", alreadyExists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const validatePhone = async (req: Request, res: Response) => {
  try {
    const { phone }: validatePhoneDTO = req.body;

    const user = await User.findOne({ phone: phone });

    if (user) {
      res
        .status(200)
        .json({ message: "Phone already exists", alreadyExists: true });
    } else {
      res
        .status(200)
        .json({ message: "Phone is available", alreadyExists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const validateEmail = async (req: Request, res: Response) => {
  try {
    const { email }: validateEmailDTO = req.body;

    const user = await User.findOne({ email: email });

    if (user) {
      res
        .status(200)
        .json({ message: "Email already exists", alreadyExists: true });
    } else {
      res
        .status(200)
        .json({ message: "Email is available", alreadyExists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, enteredOTP, email }: VerifyOTPDTO = req.body;

    const otpDocument = await OTPModel.findOne({ phone });
    if (!otpDocument || otpDocument.otp !== enteredOTP) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await User.findOneAndUpdate({ phone }, { $set: { isOTPVerified: true } });

    await OTPModel.deleteOne({ phone });

    await generateConfirmLink(email);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const userId: mongoose.Types.ObjectId = req.body.userId;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isEmailVerified: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Email verification updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating email verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const Logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("access-token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export {
  Register,
  Login,
  updatePassword,
  Logout,
  validateUsername,
  verifyOTP,
  verifyEmail,
  validatePhone,
  validateEmail
};
