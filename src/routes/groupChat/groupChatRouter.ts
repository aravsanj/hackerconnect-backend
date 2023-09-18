import express from "express";
import verifyJWT from "../../middleware/verifyJWT.js";
import { addParticipants, getGroupChatInfo, getGroupMessages, initiateGroupChat, removeParticipant, sendMessage } from "../../controllers/groupChatControllers.js";

const groupChatRouter = express.Router();

groupChatRouter.post("/initiateGroupChat", verifyJWT, initiateGroupChat);

groupChatRouter.post("/getGroupChatInfo", verifyJWT, getGroupChatInfo);

groupChatRouter.post("/sendMessage", verifyJWT, sendMessage);

groupChatRouter.post("/getMessages", verifyJWT, getGroupMessages)

groupChatRouter.post("/addParticipants", verifyJWT, addParticipants)

groupChatRouter.post("/removeParticipant", verifyJWT, removeParticipant)

export default groupChatRouter;