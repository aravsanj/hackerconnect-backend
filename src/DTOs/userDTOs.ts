import mongoose from "mongoose";

export interface GetProfileDTO {
  username: string;
}

export interface GetUserDTO {
  _id?: string;
}

export interface GetNotificationsDTO {
  _id?: string;
}

export interface UpdateUserDTO {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  username: string;
  about: string;
  coverUrl: string;
  profileUrl: string;
}

export interface SendConnectionDTO {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
}

export interface AcceptConnectionDTO {
  connectionId: mongoose.Types.ObjectId;
  notificationId: mongoose.Types.ObjectId;
}

export interface RejectConnectionDTO {
  connectionId: mongoose.Types.ObjectId;
  notificationId: mongoose.Types.ObjectId;
}

export interface RemoveConnectionDTO {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
}

export interface GetConnectionsDTO {
  userId: mongoose.Types.ObjectId;
}

export interface SearchForUsersDTO {
  searchText: string;
  page: number;
}

export interface DeleteUserDTO {
  userId: mongoose.Types.ObjectId
}