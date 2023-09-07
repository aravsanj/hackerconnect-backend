import ChatModel from "../models/Chat.js";
import { Types } from "mongoose";

async function initiateChat(userId1: Types.ObjectId, userId2: Types.ObjectId) {
  try {
    const existingChat = await findExistingChat(userId1, userId2);

    if (existingChat) {
      return existingChat;
    }

    const newChat = await createNewChat(userId1, userId2);
    return newChat;
  } catch (error) {
    throw error;
  }
}

async function findExistingChat(
  userId1: Types.ObjectId,
  userId2: Types.ObjectId
) {
  return ChatModel.findOne({
    participants: { $all: [userId1, userId2] },
  });
}

async function createNewChat(userId1: Types.ObjectId, userId2: Types.ObjectId) {

  const sortedUserIds = [userId1, userId2].sort((a, b) => a.toString().localeCompare(b.toString()));

  const chatIdentifier = sortedUserIds.join('_');

  const newChat = new ChatModel({
    identifier: chatIdentifier,
    participants: [userId1, userId2],
    messages: [],
  });

  return newChat.save();
}

export { initiateChat };
