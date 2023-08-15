import express from "express";
import verifyJWT from "../../middleware/verifyJWT.js";
import {
  getProfile,
  getUser,
  updateUser,
} from "../../controllers/userControllers.js";
import multer from "multer";
import { uploadCoversToS3, uploadProfilesToS3 } from "../../middleware/uploadToS3.js";

const userRouter = express.Router();
const upload = multer();

userRouter
  .get("/getUser", verifyJWT, getUser)
  .put("/updateUser", verifyJWT, updateUser);

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
