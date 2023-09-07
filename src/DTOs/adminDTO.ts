import mongoose from "mongoose";

export interface AdminLoginDTO {
  username: string;
  password: string;
}

export interface DeletePostDTO {
  postId: mongoose.Types.ObjectId
}