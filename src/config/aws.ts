import dotenv from 'dotenv';

dotenv.config();

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;

const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const AWS_REGION = process.env.AWS_REGION;

export { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION };