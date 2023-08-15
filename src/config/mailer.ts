import dotenv from "dotenv";
dotenv.config();

export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.EMAIL_PASS;
export const RESET_SECRET = process.env.JWT_RESET_PASS_SECRET as string;
