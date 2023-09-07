import dotenv from "dotenv";
dotenv.config();

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;
const TWILIO_RECEIVER_PHONE = process.env.TWILIO_RECEIVER_PHONE as string;

export { TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE, TWILIO_RECEIVER_PHONE };
