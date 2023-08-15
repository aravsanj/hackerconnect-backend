import dotenv from "dotenv";

dotenv.config();

export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
export const PORT = process.env.PORT;