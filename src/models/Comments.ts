import mongoose, { Document, Schema } from "mongoose";

interface Comment extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  type: "parent" | "child";
  parentComment?: mongoose.Types.ObjectId;

  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<Comment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, default: "parent" },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

const CommentModel = mongoose.model<Comment>("Comment", commentSchema);

export default CommentModel;
