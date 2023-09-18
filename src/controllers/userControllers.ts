import { Request, Response } from "express";
import User from "../models/User.js";
import Post from "../models/Posts.js";
import NotificationModel, {
  NotificationType,
} from "../models/Notifications.js";
import ConnectionRequest from "../models/ConnectionRequests.js";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/jwt.js";
import { io } from "../index.js";
import { createNotification } from "./notificationControllers.js";
import {
  AcceptConnectionDTO,
  DeleteUserDTO,
  GetNotificationsDTO,
  GetProfileDTO,
  GetUserDTO,
  RejectConnectionDTO,
  RemoveConnectionDTO,
  SearchForUsersDTO,
  SendConnectionDTO,
  UpdateUserDTO,
} from "../DTOs/userDTOs.js";
import ChatModel from "../models/Chat.js";
import PostModel from "../models/Posts.js";
import CommentModel from "../models/Comments.js";

async function getConnectionStatusHelper(senderId: string, receiverId: string) {
  const connectionStatus = await ConnectionRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  return connectionStatus ? connectionStatus.status : "notConnected";
}

async function getConnectionStatus(
  accessToken: string,
  userProfile: any
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, SECRET, async (err: any, user: any) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      const connectionStatus = await getConnectionStatusHelper(
        user._id,
        userProfile._id.toString()
      );

      resolve(connectionStatus);
    });
  });
}

const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { username }: GetProfileDTO = req.params;
    const cookies = req.cookies;
    const accessToken: string = cookies["access-token"];

    const user = await User.findOne(
      { username: username },
      {
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        dateOfBirth: 1,
        about: 1,
        title: 1,
        username: 1,
        profile: 1,
        cover: 1,
        isActive: 1,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(401).json({ message: "Account is not active" });
    }

    const rawPosts = await Post.find({ user: user._id })
      .populate("user", "username profile firstName lastName")
      .populate("likes", "username profile firstName lastName")
      .sort({ createdAt: -1 })
      .exec();

    const posts = rawPosts.map((post) => {
      const userHasLiked = post.likes.some((likedUserId) =>
        likedUserId.equals(user._id)
      );

      return {
        ...post.toObject(),
        userLiked: userHasLiked,
      };
    });

    let connectionStatus: string = "notConnected";

    if (accessToken) {
      connectionStatus = await getConnectionStatus(accessToken, user);
    }

    res.status(200).json({
      user: user,
      posts: posts,
      connectionStatus: connectionStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { _id }: GetUserDTO = req.user;

    const user: any = await User.findOne(
      {
        _id: _id,
      },
      {
        username: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        dateOfBirth: 1,
        profile: 1,
        cover: 1,
        title: 1,
      }
    )
      .populate({
        path: "connections",
        select: "firstName lastName username profile title isActive",
        match: { isActive: true },
      })
      .exec();

    if (!user) {
      throw new Error("User does not exist!");
    }

    const connections = user?.connections;

    const chatInfoPromises = connections?.map(async (connection: any) => {
      const chat = await ChatModel.findOne({
        participants: { $all: [_id, connection._id] },
      });

      const unreadMessages = chat ? chat.hasUnreadMessages : false;

      return {
        connection,
        unreadMessages,
      };
    });

    const chatsInfo = await Promise.all(chatInfoPromises);

    const userWithGroups = await User.findById(_id).populate({
      path: "groupChats",
      select: "title _id",
    });

    const combinedData = {
      user: user,
      chatInfo: chatsInfo,
      groupChats: userWithGroups?.groupChats,
    };

    res.status(200).json({ combinedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getNotifications = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { _id }: GetNotificationsDTO = req.user;

    const notifications = await NotificationModel.find(
      { userId: _id },
      {
        type: 1,
        postId: 1,
        requestId: 1,
        sender: 1,
        message: 1,
        hasAccepted: 1,
        hasRead: 1,
      }
    )
      .populate("senderId", "username profile")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching notifications" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      title,
      email,
      phone,
      dateOfBirth,
      username,
      about,
      coverUrl: cover,
      profileUrl: profile,
    }: UpdateUserDTO = req.body;

    // @ts-ignore
    const { _id }: { _id: string } = req.user;

    const user = await User.findOneAndUpdate(
      {
        _id: _id,
      },
      {
        firstName,
        lastName,
        title,
        email,
        phone,
        dateOfBirth,
        username,
        about,
        profile,
        cover,
      },
      {
        new: true,
        fields: {
          firstName: 1,
          lastName: 1,
          title: 1,
          email: 1,
          phone: 1,
          dateOfBirth: 1,
          username: 1,
          about: 1,
          profile: 1,
          cover: 1,
        },
      }
    );

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const sendConnection = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId }: SendConnectionDTO = req.body;

    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);

    if (!senderUser || !receiverUser) {
      throw new Error("Invalid sender or receiver");
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      await ConnectionRequest.deleteOne({
        sender: senderId,
        receiver: receiverId,
      });
      io.to(receiverId.toString()).emit("notification");
      return res.status(200).json({ status: "deleted" });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      receiver: receiverId,
    });

    await newRequest.save();

    await createNotification(
      receiverId,
      NotificationType.CONNECTION_REQUEST,
      newRequest._id,
      senderId,
      "You've a new connection request"
    );
    io.to(receiverId.toString()).emit("notification");

    return res.status(200).json({ response: newRequest });
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
};

const acceptConnection = async (req: Request, res: Response) => {
  try {
    const { connectionId, notificationId }: AcceptConnectionDTO = req.body;

    const connectionRequest = await ConnectionRequest.findById(connectionId);

    if (!connectionRequest)
      return res.status(401).json({ message: "No connection request found" });

    if (connectionRequest.status === "pending") {
      connectionRequest.status = "accepted";
      await connectionRequest.save();

      const senderUser: any = await User.findById(connectionRequest.sender);
      const receiverUser = await User.findById(connectionRequest.receiver);

      if (!senderUser || !receiverUser)
        return res
          .status(401)
          .json({ message: "Sender or receiver not found" });

      senderUser.connections.push(receiverUser);
      receiverUser.connections.push(senderUser);

      await senderUser.save();
      await receiverUser.save();

      await NotificationModel.findByIdAndUpdate(
        notificationId,
        { $set: { hasAccepted: true } },
        { new: true }
      );

      await createNotification(
        connectionRequest.sender,
        NotificationType.CONNECTION_REQUEST_ACCEPTED,
        null,
        connectionRequest.receiver,
        "Your connection request was accepted"
      );
      io.to(connectionRequest.sender.toString()).emit("notification");

      res.status(200).json({ message: "Connection accepted" });
    }
  } catch (error) {
    res.status(401).json({ message: "Operation failed" });
  }
};

const rejectConnection = async (req: Request, res: Response) => {
  try {
    const { connectionId, notificationId }: RejectConnectionDTO = req.body;

    const connectionRequest = await ConnectionRequest.findById(connectionId);

    if (!connectionRequest) {
      return res.status(401).json({ message: "No connection request found" });
    }

    if (connectionRequest.status !== "pending") {
      return res
        .status(401)
        .json({ message: "Connection request already processed" });
    }

    connectionRequest.status = "notConnected";
    await connectionRequest.save();

    await NotificationModel.findByIdAndDelete(notificationId);

    return res
      .status(200)
      .json({ message: "Connection rejected successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Something went wrong" });
  }
};

const removeConnection = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId }: RemoveConnectionDTO = req.body;

    const connectionRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId, status: "accepted" },
        { sender: receiverId, receiver: senderId, status: "accepted" },
      ],
    });

    if (!connectionRequest) {
      return res.status(401).json({ message: "No connection found" });
    }

    const senderUser: any = await User.findById(senderId);
    const receiverUser: any = await User.findById(receiverId);

    if (!senderUser || !receiverUser) {
      return res.status(401).json({ message: "Sender or receiver not found" });
    }

    senderUser.connections = senderUser.connections.filter(
      (connection: any) => connection.toString() !== receiverId
    );

    receiverUser.connections = receiverUser.connections.filter(
      (connection: any) => connection.toString() !== senderId
    );

    await senderUser.save();
    await receiverUser.save();

    await ConnectionRequest.findByIdAndDelete(connectionRequest._id);

    return res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Operation failed" });
  }
};

const getConnections = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId: mongoose.Types.ObjectId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "connections",
      select: "username profile cover firstName lastName title isActive",
      match: { isActive: true }, // Filter out inactive connections
    });

    if (!user) {
      throw new Error("User not found");
    }

    const connections = user.connections;

    res.status(200).json(connections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommendations = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const currentUserId: mongoose.Types.ObjectId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (currentUser) {
      const connectionIds = currentUser.connections.map((conn) =>
        conn.toString()
      );

      const nonConnectionUsers = await User.find({
        _id: { $nin: [...connectionIds, currentUserId] },
      })
        .limit(5)
        .select("profile firstName lastName username")
        .exec();

      res.status(200).json(nonConnectionUsers);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchForUsers = async (req: Request, res: Response) => {
  try {
    const { searchText, page }: SearchForUsersDTO = req.body;
    const pageSize = 7; 

    const skip = (page - 1) * pageSize; 

    const searchResults = await User.find(
      {
        $and: [
          {
            $or: [
              { firstName: { $regex: searchText, $options: "i" } },
              { lastName: { $regex: searchText, $options: "i" } },
              { username: { $regex: searchText, $options: "i" } },
            ],
          },
          { isActive: true }, 
        ],
      },
      "firstName lastName username profile cover title"
    )
      .skip(skip)
      .limit(pageSize);

    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deactivateAccount = async (req: Request, res: Response) => {
  try {
    const userId: string = req.body.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.clearCookie("access-token");
    return res
      .status(200)
      .json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { userId }: DeleteUserDTO = req.body;

    await PostModel.deleteMany({ user: userId });
    await CommentModel.deleteMany({ user: userId });
    await NotificationModel.deleteMany({ userId: userId });
    await NotificationModel.deleteMany({ senderId: userId });
    await ChatModel.deleteMany({ participants: userId });

    await User.deleteOne({ _id: userId });

    res.clearCookie("access-token");
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (e: any) {
    console.error(e);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while deleting the user",
      });
  }
};

export {
  getProfile,
  getUser,
  updateUser,
  getNotifications,
  acceptConnection,
  rejectConnection,
  sendConnection,
  removeConnection,
  getConnections,
  searchForUsers,
  getRecommendations,
  deactivateAccount,
  deleteAccount,
};
