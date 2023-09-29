import mongoose, { Schema } from "mongoose";
import { GroupMessage } from "./GroupChatSchema";

interface MentionedMessage extends GroupMessage {
  user: mongoose.Types.ObjectId;
  groupChat: mongoose.Types.ObjectId;
  hasRead: boolean;
}

const mentionedMessageSchema = new Schema<MentionedMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    groupChat: {
      type: Schema.Types.ObjectId,
      ref: "GroupChat",
      required: true,
    },
    message: { type: String, required: true },
    hasRead: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const MentionModel = mongoose.model<MentionedMessage>(
  "Mention",
  mentionedMessageSchema
);

export default MentionModel;
