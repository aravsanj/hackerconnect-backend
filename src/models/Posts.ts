import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

postSchema.pre("updateOne", async function () {
  await this.updateOne({}, { $set: { updatedAt: new Date() } });
});

const Post = mongoose.model("Post", postSchema);

export default Post;
