import { Server } from "socket.io";

let io;

const userSocketMap = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log("User Connected:", userId);

    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("User Disconnected:", userId);

      delete userSocketMap[userId];

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export { io };

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};