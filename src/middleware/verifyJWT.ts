import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/jwt.js";

type User = {
  username?: string;
  email?: string;
};

type newRequest = Request & {
  user?: User;
  email?: string;
};

function verifyJWT(req: newRequest, res: Response, next: NextFunction) {

  const accessToken = req.cookies["access-token"];

  if (!accessToken) {
    return res.status(401).send({ isLoggedIn: false });
  }

  jwt.verify(accessToken, SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(401).send({ isLoggedIn: false });
    }

    req.user = user;
  });
  next();
}

export default verifyJWT;
