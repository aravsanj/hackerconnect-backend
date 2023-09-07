import express from "express";
import { fetchReadStatus, getMessages, sendMessage } from "../../controllers/chatControllers.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const chatRouter = express.Router();

chatRouter.post("/sendMessage", verifyJWT, sendMessage);

chatRouter.post("/getMessages", verifyJWT, getMessages);

chatRouter.post("/getReadStatus", verifyJWT, fetchReadStatus);

export default chatRouter;