import mongoose, { Document, Schema, Model } from "mongoose";
interface Report {
  user: mongoose.Types.ObjectId;
  reason: "spam" | "harassment" | "hate_speech" | "other";
  customResponse?: string;
}

interface Post extends Document {
  content: string;
  user: mongoose.Types.ObjectId;
  imageURLs: string[];
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  hasLiked(userId: string): boolean;
  isReported: boolean;
  reports: Report[];
}

const postSchema = new Schema<Post>(
  {
    content: {
      type: String,
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    imageURLs: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    isReported: { type: Boolean, default: false, required: true },
    reports: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        reason: {
          type: String,
          enum: ["spam", "harassment", "hate_speech", "other"],
        },
        customResponse: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

postSchema.pre("updateOne", async function () {
  await this.updateOne({}, { $set: { updatedAt: new Date() } });
});

postSchema.methods.hasLiked = function (userId: string): boolean {
  return this.likes.includes(userId);
};

const PostModel: Model<Post> = mongoose.model<Post>("Post", postSchema);

export default PostModel;
