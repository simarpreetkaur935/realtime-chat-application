import { Server } from "socket.io";

let io;

const userSocketMap = new Map();

const getOnlineUserIds = () => [...userSocketMap.keys()];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://realtime-chat-application-gilt.vercel.app",
      ],
    },
  });

  io.on("connection", (socket) => {
    const userId = String(socket.handshake.query.userId || "");

    console.log("User Connected:", userId);

    if (userId) {
      const sockets = userSocketMap.get(userId) || new Set();
      sockets.add(socket.id);
      userSocketMap.set(userId, sockets);
      socket.join(`user:${userId}`);
    }

    io.emit("getOnlineUsers", getOnlineUserIds());

    socket.on("disconnect", () => {
      console.log("User Disconnected:", userId);

      const sockets = userSocketMap.get(userId);
      sockets?.delete(socket.id);
      if (sockets?.size === 0) userSocketMap.delete(userId);

      io.emit("getOnlineUsers", getOnlineUserIds());
      console.log("Online Users:", getOnlineUserIds());
    });
  });
};

export { io };

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(String(receiverId));
};
