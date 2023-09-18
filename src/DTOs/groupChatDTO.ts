import { Types } from "mongoose";

export interface initiateGroupChatDTO {
  title: string;
  participants: [Types.ObjectId];
  admins: [Types.ObjectId];
}

export interface sendMessageDTO {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  messageText: string;
}

export interface getGroupMessagesDTO {
  chatId: Types.ObjectId
}

export interface addParticipantsDTO {
  userIds: [Types.ObjectId];
  chatId: Types.ObjectId;
}

export interface removeParticipantDTO {
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
}