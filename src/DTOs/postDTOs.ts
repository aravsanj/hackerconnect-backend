import mongoose from "mongoose";

export interface CreatePostDTO {
  content: string;
  imageURLs: string[];
  _id: mongoose.Types.ObjectId;
}

export interface GetFeedPostsDTO {
  page: number;
}

export interface LikePostDTO {
  postId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

export interface AddCommentDTO {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
}

export interface GetCommentsDTO {
  postId: mongoose.Types.ObjectId;
  currentPage: number;
}

export interface SearchPostsDTO {
  searchText: string;
}

export interface ReportPostDTO {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  value: {
    reason: "spam" | "harassment" | "hate_speech" | "other";
    customResponse: string;
  };
}
