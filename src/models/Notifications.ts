import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  MENTION = 'mention',
  CONNECTION_REQUEST = 'connection_request',
  CONNECTION_REQUEST_ACCEPTED = "connection_request_accepted"
}

export interface Notification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  postId?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  requestId: mongoose.Types.ObjectId
  message: string;
  hasRead: boolean;
  hasAccepted: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<Notification>(
  {
    userId: { type: Schema.Types.ObjectId, required: true }, // id of the user that receives the notification
    type: { type: String, enum: Object.values(NotificationType), required: true },
    postId: { type: Schema.Types.ObjectId }, // This is optional because not all notifications are related to a post
    requestId: {type: Schema.Types.ObjectId}, // This is optional but necessary for notifications related to connection requests
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    hasRead: { type: Boolean, default: false, required: true },
    hasAccepted: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const  NotificationModel = mongoose.model<Notification>('Notification', notificationSchema);

export default NotificationModel;
