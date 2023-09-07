import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_ADMIN_SECRET } from "../config/admin.js";

type User = {
  username?: string;
  email?: string;
};

type newRequest = Request & {
  user?: User;
  email?: string;
};

function verifyAdmin(req: newRequest, res: Response, next: NextFunction) {

  const accessToken = req.cookies["x-access-token"];

  if (!accessToken) {
    return res.status(401).send({ isLoggedIn: false });
  }

  jwt.verify(accessToken, JWT_ADMIN_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(401).send({ isLoggedIn: false });
    }

    req.user = user;
  });
  next();
}

export default verifyAdmin;
