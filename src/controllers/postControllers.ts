import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Posts.js";
import Comment from "../models/Comments.js";
import { io } from "../index.js";
import { NotificationType } from "../models/Notifications.js";
import {
  createNotification,
  deleteNotification,
} from "./notificationControllers.js";
import User from "../models/User.js";
import {
  AddCommentDTO,
  CreatePostDTO,
  GetCommentsDTO,
  GetFeedPostsDTO,
  LikePostDTO,
  ReportPostDTO,
  SearchPostsDTO,
} from "../DTOs/postDTOs.js";

const createPost = async (req: Request, res: Response) => {
  try {
    const { content, imageURLs, _id: user }: CreatePostDTO = req.body;
    const newPost = new Post({ content, imageURLs, user });

    await newPost.save();

    const postDetails = await Post.findById(newPost._id)
      .populate("user", "username profile firstName lastName")
      .populate("likes", "username profile firstName lastName");

    res
      .status(201)
      .json({ message: "Post created successfully", post: postDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getFeedPosts = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { _id } = req.user as { _id: string };
    const { page }: GetFeedPostsDTO = req.body;
    const perPage = 6;

    const user = await User.findById(_id).populate("connections");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionIds = user.connections.map((connection) => connection._id);

    const reportedPostIds = await Post.find({
      "reports.user": _id,
    }).distinct("_id");

    const rawPosts = await Post.find({
      $or: [{ user: { $in: connectionIds } }, { user: _id }],
      _id: { $nin: reportedPostIds },
    })
      .populate({
        path: "user",
        select: "username profile firstName lastName isActive", // Select multiple fields
      })
      .populate("likes", "username profile firstName lastName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    // @ts-ignore
    const activeUsersPosts = rawPosts.filter((post) => post.user.isActive);

    const posts = activeUsersPosts.map((post) => {
      const userHasLiked = post.likes.some((likedUserId) =>
        likedUserId.equals(_id)
      );

      return {
        ...post.toObject(),
        userLiked: userHasLiked,
      };
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error getting feed posts:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate({ path: "user", select: "username profile firstName lastName" })
      .populate("likes", "username profile firstName lastName")
      .exec();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const likePost = async (req: Request, res: Response) => {
  try {
    const { postId, senderId, userId }: LikePostDTO = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userLiked = post.likes.includes(senderId);

    if (userLiked) {
      post.likes = post.likes.filter((like) => !like.equals(senderId));
    } else {
      post.likes.push(senderId);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("likes", "username profile firstName lastName")
      .exec();

    if (userId === senderId) return res.status(200).json({ post: updatedPost });

    try {
      if (userLiked) {
        await deleteNotification(
          userId,
          NotificationType.LIKE,
          postId,
          senderId
        );
      } else {
        await createNotification(
          userId,
          NotificationType.LIKE,
          postId,
          senderId,
          "Your post was liked!"
        );
      }

      io.to(userId.toString()).emit("notification");

      return res.status(200).json({ post: updatedPost });
    } catch (error) {
      console.error("Notification error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const addComment = async (req: Request, res: Response) => {
  try {
    const {
      postId,
      userId: senderId,
      content,
      mentions,
    }: AddCommentDTO = req.body;

    console.log(mentions);

    const post = await Post.findById(postId)
      .populate({ path: "user", select: "_id" })
      .exec();

    const userId: mongoose.Types.ObjectId = post?.user
      ._id as mongoose.Types.ObjectId;

    if (!post || !userId) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      user: senderId,
      content,
      post: postId,
    });

    await newComment.save();

    post.comments.push(newComment._id);
    await post.save();

    const postedComment = await Comment.findOne({
      post: postId,
      _id: newComment._id,
    })
      .populate("user", "username profile firstName lastName")
      .exec();

    await createNotification(
      userId,
      NotificationType.COMMENT,
      postId,
      senderId,
      "Your have a new comment!"
    );

    io.to(userId.toString()).emit("notification");

    if (mentions.length !== 0) {
      for (const mention of mentions) {
        await createNotification(
          mention.id,
          NotificationType.MENTION,
          postId,
          senderId,
          "Someone just mentioned you!"
        );

        io.to(mention.id.toString()).emit("notification");
      }
    }

    return res
      .status(201)
      .json({ message: "Comment added successfully", comment: postedComment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getComments = async (req: Request, res: Response) => {
  try {
    const { postId, currentPage }: GetCommentsDTO = req.body;
    const itemsPerPage = 3;

    const skip = (currentPage - 1) * itemsPerPage;

    const commentsForPost = await Comment.find({ post: postId })
      .populate("user", "username profile firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .exec();

    return res.status(200).json({ comments: commentsForPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const searchPosts = async (req: Request, res: Response) => {
  try {
    const { searchText, page }: SearchPostsDTO = req.body;
    const pageSize = 5;

    const skip = (page - 1) * pageSize;

    const rawPosts = await Post.find({
      content: { $regex: searchText, $options: "i" },
    })
      .populate("user", "firstName lastName profile username isActive")
      .select("content")
      .skip(skip)
      .limit(pageSize);

    // @ts-ignore
    const postResults = rawPosts.filter((post) => post.user.isActive);

    res.json(postResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const reportPost = async (req: Request, res: Response) => {
  try {
    const { postId, userId, value }: ReportPostDTO = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { reason, customResponse } = value;

    const reportEntry = {
      user: userId,
      reason,
      customResponse,
    };

    post.isReported = true;
    post.reports.push(reportEntry);

    await post.save();

    return res.status(200).json({ message: "Post reported successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while reporting the post" });
  }
};

export {
  createPost,
  getFeedPosts,
  likePost,
  getPost,
  addComment,
  getComments,
  searchPosts,
  reportPost,
};
