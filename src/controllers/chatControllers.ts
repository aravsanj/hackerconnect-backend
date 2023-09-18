import { Request, Response } from "express";
import { initiateChat } from "../helpers/chat.helper.js";
import { getMessageDTO, sendMessageDTO } from "../DTOs/chatDTO.js";
import ChatModel from "../models/Chat.js";
import { io } from "../index.js";

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { name, senderId, receiverId, content }: sendMessageDTO = req.body;

    const chat = await initiateChat(senderId, receiverId);

    chat.messages.push({ sender: senderId, message: content });
    chat.hasUnreadMessages = true;
    await chat.save();

    const lastMessage = chat.lastMessage;

    const sortedUserIds = [senderId, receiverId].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    const chatIdentifier = sortedUserIds.join("_");

    io.to(receiverId.toString()).emit("message-received", {
      identifier: chatIdentifier,
      name: name,
      senderId: senderId,
    });

    res.json({ success: true, lastMessage: lastMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while sending the message." });
  }
};

const getMessages = async (req: Request, res: Response) => {
  try {
    const { identifier: chatIdentifier }: getMessageDTO = req.body;

    const chat = await ChatModel.findOne({ identifier: chatIdentifier })
      .populate("participants", "_id firstName lastName")
      .exec();

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const sortedMessages = chat.messages.sort(
      (a, b) =>
        (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
    );

    chat.hasUnreadMessages = false;
    await chat.save();

    res.json({ sortedMessages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const fetchReadStatus = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    const chat = await ChatModel.findOne({ identifier });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const hasUnreadStatus = chat.hasUnreadMessages;

    res.json({ hasUnreadStatus });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export { sendMessage, getMessages, fetchReadStatus };
