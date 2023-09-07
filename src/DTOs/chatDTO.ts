import { Types } from "mongoose";

export interface sendMessageDTO {
  name: string;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
}

export interface getMessageDTO {
  identifier: string;
}

export interface markReadDTO {
  chatId: Types.ObjectId;
  messageId: Types.ObjectId
}