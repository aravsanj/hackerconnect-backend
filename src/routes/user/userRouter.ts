import express from "express";
import verifyJWT from "../../middleware/verifyJWT.js";
import {
  getProfile,
  getUser,
  updateUser,
  getNotifications,
  acceptConnection,
  rejectConnection,
  sendConnection,
  removeConnection,
  getConnections,
  searchForUsers,
  getRecommendations,
} from "../../controllers/userControllers.js";
import multer from "multer";
import {
  uploadCoversToS3,
  uploadProfilesToS3,
} from "../../middleware/uploadToS3.js";
import { updateNotifications } from "../../controllers/notificationControllers.js";

const userRouter = express.Router();
const upload = multer();

userRouter
  .get("/getUser", verifyJWT, getUser)
  .put("/updateUser", verifyJWT, updateUser);

userRouter.get("/getNotifications", verifyJWT, getNotifications);

userRouter.post("/updateNotifications", verifyJWT, updateNotifications);

userRouter.post("/acceptConnection", verifyJWT, acceptConnection) 
userRouter.post("/rejectConnection", verifyJWT, rejectConnection) 
userRouter.post("/sendConnection", verifyJWT, sendConnection)
userRouter.post("/removeConnection", verifyJWT, removeConnection)
userRouter.get("/getConnections", verifyJWT, getConnections)
userRouter.get("/getRecommendations", verifyJWT, getRecommendations)

userRouter.post("/search", verifyJWT, searchForUsers)

userRouter.get("/:username", getProfile);

userRouter.post(
  "/uploadProfile",
  upload.single("profile"),
  uploadProfilesToS3,
  (req, res) => {
    // @ts-ignore
    res.status(200).json({ imageUrl: req.s3Url });
  }
);

userRouter.post(
  "/uploadCover",
  upload.single("cover"),
  uploadCoversToS3,
  (req, res) => {
    // @ts-ignore
    res.status(200).json({ imageUrl: req.s3Url });
  }
);

export default userRouter;
