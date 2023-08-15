import { Request, Response } from "express";
import User from "../models/User.js";
import Post from "../models/Posts.js";

const getProfile = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const user = await User.findOne(
      { username: username },
      {
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        dateOfBirth: 1,
        about: 1,
        title: 1,
        username: 1,
        profile: 1,
        cover: 1,
      }
    );

    const posts = await Post.find({ user: user?._id })
      .populate({
        path: "user",
        select: "username",
      })
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({ user: user, posts: posts });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne(
      {
        // @ts-ignore
        _id: req.user?._id,
      },
      {
        username: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        dateOfBirth: 1,
        profile: 1,
      }
    );
    res.status(200).json({ user });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    title,
    email,
    phone,
    dateOfBirth,
    username,
    about,
    coverUrl: cover,
    profileUrl: profile,
  } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      {
        // @ts-ignore
        _id: req.user?._id,
      },
      {
        firstName,
        lastName,
        title,
        email,
        phone,
        dateOfBirth,
        username,
        about,
        profile,
        cover,
      },
      {
        new: true,
        fields: {
          firstName: 1,
          lastName: 1,
          title: 1,
          email: 1,
          phone: 1,
          dateOfBirth: 1,
          username: 1,
          about: 1,
          profile: 1,
          cover: 1,
        },
      }
    );

    res.status(200).json({ user });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export { getProfile, getUser, updateUser };
