import { Types } from "mongoose";

export interface initiateGroupChatDTO {
  title: string;
  participants: [Types.ObjectId];
  admins: [Types.ObjectId];
}

interface MentionItem {
  display: string;
  id: Types.ObjectId;
  childIndex: number;
  index: number;
  plainTextIndex: number;
}

export interface sendMessageDTO {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  messageText: string;
  mentions: MentionItem[]
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