// @ts-ignore
import { Request, Response, NextFunction } from "express";
import {
  TWILIO_PHONE,
  TWILIO_RECEIVER_PHONE,
  TWILIO_SID,
  TWILIO_TOKEN,
} from "../config/twilio.js";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import OTPModel from "../models/OTP.js";

const client = twilio(TWILIO_SID, TWILIO_TOKEN);

const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;

    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const message = `Your OTP is ${OTP}`;

    client.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: TWILIO_RECEIVER_PHONE,
    });

    const otpDocument = new OTPModel({
      phone: TWILIO_RECEIVER_PHONE,
      otp: OTP,
    });

    await otpDocument.save();

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }

  next();
};

export default sendOTP;
