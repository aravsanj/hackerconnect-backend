import mongoose from "mongoose";
import NotificationModel, {
  NotificationType,
} from "../models/Notifications.js";
import { Request, Response } from "express";

async function createNotification(
  userId: mongoose.Types.ObjectId,
  type: NotificationType,
  relatedId: mongoose.Types.ObjectId | null,
  senderId: mongoose.Types.ObjectId,
  message: string
) {
  const notification = new NotificationModel({
    userId,
    type,
    postId: type === NotificationType.LIKE || NotificationType.COMMENT ? relatedId : undefined,
    requestId: type === NotificationType.CONNECTION_REQUEST ? relatedId: undefined,
    senderId: senderId,
    message,
  });

  await notification.save();
}

async function deleteNotification(
  userId: mongoose.Types.ObjectId,
  type: NotificationType,
  postId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId
) {
  await NotificationModel.deleteOne({
    userId,
    type,
    postId: type === NotificationType.LIKE ? postId : undefined,
    senderId,
  });
}

async function updateNotifications(req: Request, res: Response) {
  try {
    const response = await NotificationModel.updateMany(
      {},
      { $set: { hasRead: true } }
    );
    res.status(200).json("success");
  } catch (e) {
    console.error(e);
    res.status(401).json("failed");
  }
}

export { updateNotifications, createNotification, deleteNotification };
