import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/jwt.js";

type userData = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  username: string;
  hashedPassword: string;
  phone: string;
};

const Register = async (req: Request, res: Response) => {
  const { firstName, lastName, dateOfBirth, email, username, password, phone } =
    req.body;

  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userData: userData = {
    firstName,
    lastName,
    dateOfBirth,
    email,
    username,
    hashedPassword,
    phone,
  };

  const newUser = new User(userData);

  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const Login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await User.findOne(
    { username: username },
    { hashedPassword: 1, username: 1, email: 1 }
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid user" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        _id: user._id,
      },
      SECRET
    );

    return res
      .cookie("access-token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: "ok" });
  } else {
    return res.status(401).json({ message: "Invalid password" });
  }
};

const updatePassword = async (req: Request, res: Response) => {
  const { password, _id } = req.body;

  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: _id,
      },
      {
        hashedPassword,
      }
    );
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const validateUsername = async (req: Request, res: Response) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if(user) {
      res.status(200).json({ message: "Username already exists", alreadyExists: true });
    } else {
      res.status(200).json({ message: "Username is available", alreadyExists: false });
    }
  } catch (e) {
    console.error(e);
  }
};

const Logout = (req: Request, res: Response) => {
  res.clearCookie("access-token");
  res.status(200).json({ message: "ok" });
};

export { Register, Login, updatePassword, Logout, validateUsername };
