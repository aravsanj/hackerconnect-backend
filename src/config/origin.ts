import dotenv from "dotenv";

dotenv.config();

export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
export const PORT = process.env.PORT;

export const ALLOWED_ORIGIN_AWS = "http://ec2-54-156-58-230.compute-1.amazonaws.com";