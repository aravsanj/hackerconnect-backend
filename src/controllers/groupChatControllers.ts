import {
  addParticipantsDTO,
  getGroupMessagesDTO,
  initiateGroupChatDTO,
  removeParticipantDTO,
} from "../DTOs/groupChatDTO";
import GroupChatModel, {
  GroupChat,
  GroupMessage,
} from "../models/GroupChatSchema.js";
import { Request, Response } from "express";
import User from "../models/User.js";
import { sendMessageDTO } from "../DTOs/groupChatDTO";
import { Types } from "mongoose";
import { io } from "../index.js";
import MentionModel from "../models/Mentions.js";
import mongoose from "mongoose";

const initiateGroupChat = async (req: Request, res: Response) => {
  try {
    const { title, participants, admins }: initiateGroupChatDTO = req.body;

    const newGroupChat: GroupChat = new GroupChatModel({
      title,
      participants,
      admins,
      lastMessage: null,
    });

    const savedGroupChat = await newGroupChat.save();

    for (const participantId of participants) {
      const participant = await User.findById(participantId);

      if (participant) {
        participant.groupChats.push(savedGroupChat._id);
        await participant.save();
      }
    }

    res.status(201).json(savedGroupChat);
  } catch (error) {
    console.error("Error initiating group chat:", error);
    res.status(500).json({ error: "Could not initiate group chat" });
  }
};

const getGroupChatInfo = async (req: Request, res: Response) => {
  try {
    const groupId: string = req.body.groupId;

    const group: GroupChat | null = await GroupChatModel.findById(
      groupId
    ).populate("participants", "userId");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const populatedParticipants = await User.find({
      _id: { $in: group.participants },
    }).select("firstName lastName username profile");

    const populatedAdmins = await User.find({
      _id: { $in: group.admins },
    }).select("firstName lastName username profile");

    res.status(200).json({
      _id: group._id,
      title: group.title,
      participants: populatedParticipants,
      admins: populatedAdmins,
      messages: group.messages,
      lastMessage: group.lastMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

async function sendMessageToGroupChat(
  chatId: Types.ObjectId,
  senderId: Types.ObjectId,
  messageText: string
): Promise<GroupMessage | null> {
  try {
    const groupChat = await GroupChatModel.findById(chatId);

    if (!groupChat) {
      throw new Error("Group chat not found");
    }

    const newMessage: GroupMessage = {
      sender: senderId,
      message: messageText,
    };

    groupChat.messages.push(newMessage);

    groupChat.lastMessage = newMessage;

    await groupChat.save();

    return newMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, senderId, messageText, mentions }: sendMessageDTO =
      req.body;

    if (!chatId || !senderId || !messageText) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const newMessage = await sendMessageToGroupChat(
      chatId,
      senderId,
      messageText
    );

    if (newMessage) {
      if (mentions.length !== 0) {
        for (const mention of mentions) {
          const mentionData = {
            user: mention.id,
            sender: senderId,
            groupChat: chatId,
            message: messageText,
          };

          const mentionDocument = new MentionModel(mentionData);
          await mentionDocument.save();

          io.to(mention.id.toString()).emit("group-mention");
        }
      }

      io.to(chatId.toString()).emit("group-message-received", {
        newMessage,
      });

      return res
        .status(200)
        .json({ message: "Message sent successfully", newMessage });
    } else {
      return res.status(500).json({ error: "Failed to send message" });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const fetchSeenStatus = async (req: Request, res: Response) => {
  try {
    const { groupChatId, messageId } = req.body;

    const groupChat: GroupChat | null = await GroupChatModel.findById(groupChatId);

    if (!groupChat) {
      return res.status(404).json({ error: "Group chat not found" });
    }
    //@ts-ignore 
    const message = groupChat.messages.find((msg) => msg._id.equals(messageId));

    if (!message) {
      return res.status(404).json({ error: "Message not found in the group chat" });
    }
    res.json({ seenBy: message.seenBy });
  } catch (error) {
    console.error("Error retrieving seenBy array:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markAllMessagesAsSeen = async (req: Request, res: Response) => {
  try {
    const { chatId, userId, firstName, lastName, profile, userName } = req.body;

    const groupChat = await GroupChatModel.findById(chatId);

    if (!groupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const seenByObject = {
      user: userId,
      firstName,
      lastName,
      profile,
      username: userName,
    };

    groupChat.messages.forEach((message: GroupMessage) => { 
      if (message.sender.toString() !== userId && message !== undefined) {
        // @ts-ignore
        const userExistsInSeenBy = message?.seenBy.some((seenBy) => seenBy.username === userName);

        if (!userExistsInSeenBy) {
          message.seenBy = message.seenBy || [];
          message.seenBy.push(seenByObject);
        }
      }
    });

    await groupChat.save();

    return res.status(200).json({ message: "SeenBy updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getGroupMessages = async (req: Request, res: Response) => {
  try {
    const { chatId }: getGroupMessagesDTO = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chat: GroupChat | null = await GroupChatModel.findById(
      chatId
    ).populate({
      path: "messages.sender",
      model: "User",
      select: "firstName lastName profile",
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = chat.messages.map((message: any) => ({
      id: message._id,
      sender: {
        id: message.sender._id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        avatarUrl: message.sender.profile,
      },
      text: message.message,
    }));

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addParticipants = async (req: Request, res: Response) => {
  try {
    const { chatId, userIds }: addParticipantsDTO = req.body;

    const chat: GroupChat | null = await GroupChatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const addedParticipants: Types.ObjectId[] = [];

    for (const userId of userIds) {
      if (!chat.participants.includes(userId)) {
        chat.participants.push(userId);
        addedParticipants.push(userId);

        const user = await User.findById(userId);

        if (user) {
          user.groupChats.push(chat._id);
          await user.save();
        }
      }
    }

    if (addedParticipants.length > 0) {
      await chat.save();

      return res
        .status(200)
        .json({ message: "Participants added successfully", chat });
    } else {
      return res
        .status(400)
        .json({ message: "All users are already participants" });
    }
  } catch (error) {
    console.error("Error adding participants to chat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeParticipant = async (req: Request, res: Response) => {
  try {
    const { chatId, userId }: removeParticipantDTO = req.body;

    const chat: GroupChat | null = await GroupChatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const index = chat.participants.indexOf(userId);

    if (index !== -1) {
      chat.participants.splice(index, 1);

      const user = await User.findById(userId);

      if (user) {
        const chatIndex = user.groupChats.indexOf(chat._id);

        if (chatIndex !== -1) {
          user.groupChats.splice(chatIndex, 1);
          await user.save();
        }
      }

      await chat.save();

      return res
        .status(200)
        .json({ message: "Participant removed successfully", chat });
    } else {
      return res
        .status(400)
        .json({ message: "User is not a participant in this chat" });
    }
  } catch (error) {
    console.error("Error removing participant from chat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMentionedMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const mentionedMessages = await MentionModel.find({ user: userId })
      .populate("sender", "profile username")
      .populate("groupChat", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(mentionedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
};

const hasUnreadMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const unreadMessage = await MentionModel.findOne({
      user: userId,
      hasRead: false,
    });

    if (unreadMessage) {
      return res.json({ hasUnread: true });
    } else {
      return res.json({ hasUnread: false });
    }
  } catch (error) {
    res.json({ message: "Error checking for unread messages:" });
  }
};

const changeReadStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const mentionedMessages = await MentionModel.find({
      user: userId,
      hasRead: false,
    });

    if (!mentionedMessages || mentionedMessages.length === 0) {
      return res.status(404).json({ message: "Mentioned messages not found" });
    }

    for (const mentionedMessage of mentionedMessages) {
      mentionedMessage.hasRead = true;
      await mentionedMessage.save();
    }

    return res
      .status(200)
      .json({ message: "hasRead status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  initiateGroupChat,
  getGroupChatInfo,
  sendMessage,
  getGroupMessages,
  addParticipants,
  removeParticipant,
  getMentionedMessages,
  changeReadStatus,
  hasUnreadMessages,
  markAllMessagesAsSeen,
  fetchSeenStatus,
};
