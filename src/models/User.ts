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
    isOTPVerified: {
      type: Boolean,
      require: true,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      require: true,
      default: false,
    },
    title: String,
    gender: String,
    about: String,
    profile: {
      type: String,
      default:
        "https://hackerconnect-images.s3.amazonaws.com/defaults/7309681.jpg",
      required: true,
    },
    cover: {
      type: String,
      default:
        "https://hackerconnect-images.s3.amazonaws.com/defaults/1062.jpg",
      required: true,
    },
    isBlocked: Boolean,
    isVerified: Boolean,
    isActive: Boolean,
    connectionRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ConnectionRequest" },
    ],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
