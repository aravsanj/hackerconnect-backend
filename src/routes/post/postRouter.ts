import express from "express";
import verifyJWT from "../../middleware/verifyJWT.js";
import { createPost, getFeedPosts } from "../../controllers/postControllers.js";

const postRouter = express.Router();

postRouter.post("/createPost", verifyJWT, createPost);

postRouter.get("/getPosts", verifyJWT, getFeedPosts);

export default postRouter;
