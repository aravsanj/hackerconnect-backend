import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { JWT_ADMIN_SECRET } from "../config/admin.js";
import { Request, Response } from "express";
import Post from "../models/Posts.js";
import { AdminLoginDTO, DeletePostDTO } from "../DTOs/adminDTO.js";
import { RegisterDTO } from "../DTOs/authDTOs.js";
import User from "../models/User.js";
import PostModel from "../models/Posts.js";

const generateToken = async (
  username: string,
  password: string
): Promise<string> => {
  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      throw new Error("Admin not found");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const expiresIn = "1h";
    const token = jwt.sign({ adminId: admin._id }, JWT_ADMIN_SECRET, {
      expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error("Authentication failed");
  }
};

const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password }: AdminLoginDTO = req.body;

    const token = await generateToken(username, password);

    res
      .cookie("x-access-token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: "Authentication successful" });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

const getReportedPosts = async (req: Request, res: Response) => {
  try {
    const reportedPosts = await Post.find({ isReported: true })
      .populate("user", "firstName lastName")
      .populate("reports.user", "firstName lastName")
      .select("content reports");

    res.json(reportedPosts);
  } catch (error) {
    console.error("Error fetching reported posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const createNewAccount = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      username,
      password,
      phone,
    }: RegisterDTO = req.body;

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      firstName,
      lastName,
      dateOfBirth,
      email,
      username,
      hashedPassword,
      phone,
      isOTPVerified: true,
    };

    const newUser = new User(userData);

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId }: DeletePostDTO = req.body;

    const deletedPost = await PostModel.findByIdAndDelete(postId);

    if (deletedPost) {
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the post" });
  }
};

export { adminLogin, getReportedPosts, createNewAccount, deletePost };
