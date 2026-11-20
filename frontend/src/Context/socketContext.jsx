import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config/api";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser?.user?._id) {
      const socketInstance = io(API_URL, {
        query: {
          userId: authUser.user._id,
        },
      });

      setSocket(socketInstance);

      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUsers(Array.isArray(users) ? users.map(String) : []);
      });

      return () => {
        socketInstance.close();
        setSocket(null);
      };
    }

    setOnlineUsers([]);
    setSocket(null);
  }, [authUser]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
