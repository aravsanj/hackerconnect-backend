import nodemailer from "nodemailer";
import { EMAIL, PASSWORD, RESET_SECRET } from "../config/mailer.js";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { ALLOWED_ORIGIN } from "../config/origin.js";

const generateResetLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email }, { _id: 1 });

  if (!user) {
    return res.status(404).send("Email not found");
  }

  const token = jwt.sign({ id: user._id }, RESET_SECRET, { expiresIn: 3600 });

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  let mailOptions = {
    from: EMAIL,
    to: email,
    subject: "HackerConnect - Your reset password link",
    text: `${ALLOWED_ORIGIN}/reset-password/${user._id}/${token}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      res.status(500).send("Something went wrong");
    } else {
      console.log("Email sent: " + info.response);
      res.status(201).send("Email successfully send");
    }
  });
};

export default generateResetLink;
