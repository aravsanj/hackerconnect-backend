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

connectDB();

const corsOptions = {
  origin: function (origin: any, callback: any) {
    const allowedOrigins = [ALLOWED_ORIGIN];
    const isAllowed = allowedOrigins.includes(origin);
    callback(null, isAllowed);
  },
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

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
  });

  socket.on("message-typing", (item) => {
    io.to(item.receiverId).emit("sender-typing", {
      chatIdentifier: item.chatIdentifier,
      message: item.message,
    })
  })
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/admin", adminRouter)
app.use("/chat", chatRouter)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at localhost:${PORT}`);
});

export { io };
