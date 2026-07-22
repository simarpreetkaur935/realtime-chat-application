import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./api/routes/userauth.js"
import cookieParser from "cookie-parser";
import messageRouter from "./api/routes/messageroute.js"
import userRouter from "./api/routes/userroute.js"
import cors from "cors";
dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://realtime-chat-application-gilt.vercel.app"
    ],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected with Database");
  })
  .catch((err) => {
    console.log("Connection Failed");
    console.log(err);
  });

  // Register routes
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);


// Default Route
app.use((req, res) => {
  res.status(400).json({
    msg: "Bad Request",
  });
});

export default app;