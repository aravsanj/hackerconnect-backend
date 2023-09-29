import express from "express";
import verifyJWT from "../../middleware/verifyJWT.js";
import {
  createPost,
  getFeedPosts,
  getPost,
  likePost,
  addComment,
  getComments,
  searchPosts,
  reportPost,
  addReply,
  getReplies,
  deleteComment,
} from "../../controllers/postControllers.js";
import { uploadPostImageToS3 } from "../../middleware/uploadToS3.js";
import multer from "multer";

const postRouter = express.Router();
const upload = multer();

postRouter.post("/createPost", verifyJWT, createPost);

postRouter.post("/getPosts", verifyJWT, getFeedPosts);

postRouter.get("/:postId", verifyJWT, getPost);

postRouter.post(
  "/uploadImage",
  verifyJWT,
  upload.single("image"),
  uploadPostImageToS3,
  (req, res) => {
    // @ts-ignore
    res.status(200).json({ imageUrl: req.s3Url });
  }
);

postRouter.post("/likePost", verifyJWT, likePost);

postRouter.post("/addComment", verifyJWT, addComment);

postRouter.post("/deleteComment", verifyJWT, deleteComment)

postRouter.post("/addReply", verifyJWT, addReply);

postRouter.post("/getComments", verifyJWT, getComments);

postRouter.post("/getReplies", verifyJWT, getReplies);

postRouter.post("/search", verifyJWT, searchPosts);

postRouter.post("/report", verifyJWT, reportPost);

export default postRouter;
