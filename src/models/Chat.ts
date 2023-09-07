import mongoose, { Document, Schema, Types } from "mongoose";

interface Message {
  sender: string | Types.ObjectId;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Chat extends Document {
  identifier: string;
  participants: Types.ObjectId[];
  messages: Message[];
  lastMessage: Message | null;
  hasUnreadMessages: boolean;
}

const messageSchema = new Schema<Message>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

const chatSchema = new Schema<Chat>(
  {
    identifier: { type: String, required: true, unique: true },
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [messageSchema],
    lastMessage: messageSchema,
    hasUnreadMessages: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

chatSchema.pre<Chat>("save", async function (next) {
  if (this.isModified("messages")) {
    if (this.messages.length > 0) {
      this.lastMessage = this.messages[this.messages.length - 1];
    } else {
      this.lastMessage = null;
    }
  }
  next();
});
const ChatModel = mongoose.model<Chat>("Chat", chatSchema);

export default ChatModel;
