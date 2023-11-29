import express, { Express, Request, Response } from "express";
import authRouter from "./routes/auth/authRouter.js";
import userRouter from "./routes/user/userRouter.js";
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { ALLOWED_ORIGIN, PORT } from "./config/origin.js";
import postRouter from "./routes/post/postRouter.js";
import http from "http";
import { Server } from "socket.io";
import adminRouter from "./routes/admin/adminRouter.js";
import chatRouter from "./routes/chat/chatRouter.js";
import groupChatRouter from "./routes/groupChat/groupChatRouter.js";
import getUserConnectionIds from "./helpers/getUserConnections.js";

connectDB();

const corsOptions = {
  origin: ALLOWED_ORIGIN,
  optionsSuccessStatus: 200,
  credentials: true,
};

const app: Express = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection",  (socket) => {
  socket.on("join", async (room) => {
    socket.join(room);
    const connectionIds = await getUserConnectionIds(room);
    for (const id of connectionIds) {
      io.to(id).emit("connection-online", room)
    }
  });

  socket.on("join-group", (userId, selectedGroup) => {
    socket.join(selectedGroup);
  });

  socket.on("message-typing", (item) => {
    io.to(item.receiverId).emit("sender-typing", {
      chatIdentifier: item.chatIdentifier,
      message: item.message,
    });
  });

  socket.on("sender-typing-group", (selectedGroup, name, message) => {
    socket.to(selectedGroup).emit("someone-typing-group", name, message);
  });
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/admin", adminRouter);
app.use("/chat", chatRouter);
app.use("/group-chat", groupChatRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at localhost:${PORT}`);
});

// cron.schedule("* 5 * * * *", markInactiveUsersOffline);

export { io };
