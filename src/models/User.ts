import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    location: String,
    dateOfBirth: {
      type: Date,
      required: true,
    },
    isOTPVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
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
    isVerified: Boolean,
    isActive: { type: Boolean, default: true, required: true },
    connectionRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ConnectionRequest" },
    ],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hasBlocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: Array,
    notifications: Array,
    bookmarks: Array,
    hashedPassword: {
      type: String,
      required: true,
    },
    groupChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }],
    lastActivity: { type: Date },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("updateOne", async function () {
  await this.updateOne({}, { $set: { updatedAt: new Date() } });
});

userSchema.methods.updateLastActivity = async function () {
  this.lastActivity = new Date();
  this.isOnline = true;
  await this.save();
};

userSchema.statics.markOfflineInactiveUsers = async function () {
  const inactiveThreshold = new Date(Date.now() - 5 * 60 * 1000);
  await this.updateMany(
    { lastActivity: { $lt: inactiveThreshold }, isOnline: true },
    { isOnline: false }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
