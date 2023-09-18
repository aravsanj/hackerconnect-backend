import mongoose, { Document, Schema, Types } from "mongoose";

export interface GroupMessage {
  sender: string | Types.ObjectId;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupChat extends Document {
  title: string;
  participants: Types.ObjectId[];
  admins: Types.ObjectId[];
  messages: GroupMessage[];
  lastMessage: GroupMessage | null;
}

const groupMessageSchema = new Schema<GroupMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

const groupChatSchema = new Schema<GroupChat>(
  {
    title: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], 
    messages: [groupMessageSchema],
    lastMessage: groupMessageSchema,
  },
  { timestamps: true }
);

const GroupChatModel = mongoose.model<GroupChat>("GroupChat", groupChatSchema);

export default GroupChatModel;
