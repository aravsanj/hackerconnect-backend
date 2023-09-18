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
interface MentionItem {
  display: string;
  id: mongoose.Types.ObjectId;
  childIndex: number;
  index: number;
  plainTextIndex: number;
}
export interface AddCommentDTO {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  mentions: MentionItem[]
}

export interface GetCommentsDTO {
  postId: mongoose.Types.ObjectId;
  currentPage: number;
}

export interface SearchPostsDTO {
  searchText: string;
  page: number;
}

export interface ReportPostDTO {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  value: {
    reason: "spam" | "harassment" | "hate_speech" | "other";
    customResponse: string;
  };
}
