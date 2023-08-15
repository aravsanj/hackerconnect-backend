import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      require: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    phone: {
      type: String,
      require: true,
      unique: true,
    },
    location: String,
    dateOfBirth: {
      type: Date,
      require: true,
    },
    title: String,
    gender: String,
    about: String,
    profile: String,
    cover: String,
    isBlocked: Boolean,
    isVerified: Boolean,
    isActive: Boolean,
    connectionRequests: Array,
    connections: Array,
    followers: Array,
    following: Array,
    blockedUsers: Array,
    posts: Array,
    notifications: Array,
    bookmarks: Array,
    hashedPassword: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("updateOne", async function () {
  await this.updateOne({}, { $set: { updatedAt: new Date() } });
});

const User = mongoose.model("User", userSchema);

export default User;
