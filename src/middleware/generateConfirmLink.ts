import nodemailer from "nodemailer";
import { EMAIL, PASSWORD, RESET_SECRET } from "../config/mailer.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { ALLOWED_ORIGIN } from "../config/origin.js";

const generateConfirmLink = async (email: string) => {

  const user = await User.findOne({ email: email }, { _id: 1 });

  if (!user) {
    throw new Error("Email not found");
  }

  const token = jwt.sign({ id: user._id }, RESET_SECRET, { expiresIn: 300 });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Konnect - Your confirm link",
    text: `${ALLOWED_ORIGIN}/confirm-email/${user._id}/${token}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  
};

export default generateConfirmLink;
