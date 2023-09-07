import dotenv from 'dotenv';

dotenv.config();

const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET as string;


export { JWT_ADMIN_SECRET };