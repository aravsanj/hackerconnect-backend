import { Request, Response } from "express";
import Post from "../models/Posts.js";

const createPost = async (req: Request, res: Response) => {
  const { content, _id } = req.body;

  const newPost = new Post({ content, user: _id });

  try {
    await newPost.save();
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getFeedPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate({ path: "user", select: "username profile firstName lastName" })
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json({ posts });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export { createPost, getFeedPosts };
