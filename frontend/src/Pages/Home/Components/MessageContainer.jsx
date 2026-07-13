import React, { useEffect, useRef, useState } from "react";
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import axios from "axios";
import { useAuth } from "../../../Context/AuthContext";
import userConversation from "../../../Zustand/userConversation";
import Notification from "../../../notification/notification.wav";
import { useSocketContext } from "../../../Context/socketContext";


const MessageContainer = ({ setShowSidebar }) => {
  const { authUser } = useAuth();

  const {
    messages,
    setMessages,
    selectedConversation,
    setSelectedConversation,
  } = userConversation();
  console.log("messages =", messages);
console.log("Is Array =", Array.isArray(messages));
console.log("Type =", typeof messages);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const {socket} = useSocketContext();

  
  const lastMessageRef = useRef();


  useEffect(() => {
  if (!socket) return;

  socket.on("newMessage", (newMessage) => {
    console.log("Socket Message:", newMessage);

    const sound = new Audio(Notification);
    sound.play();

    setMessages((prev) => {
      if (!Array.isArray(prev)) {
        return [newMessage];
      }

      return [...prev, newMessage];
    });
  });

  return () => {
    socket.off("newMessage");
  };
}, [socket]);

  // ================= Auto Scroll =================



  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }, [messages]);

  // ================= Get Messages =================
useEffect(() => {
  const getMessages = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `https://realtime-chat-application-bcwz.onrender.com/api/message/${selectedConversation?._id}`,
        {
          withCredentials: true,
        }
      );

      console.log("Full API Response:", res.data);

      const data = res.data;

      if (!data.success) {
        console.log(data.message);
        setMessages([]);
        setLoading(false);
        return;
      }

      console.log("Messages:", data.messages);
      console.log("Is Array:", Array.isArray(data.messages));

      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setMessages([]);
      setLoading(false);
    }
  };

  if (selectedConversation?._id) {
    getMessages();
  }
}, [selectedConversation?._id]);

  // ================= Handle Input =================

  const handleMessage = (e) => {
    setSendData(e.target.value);
  };

  // ================= Send Message =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sendData.trim()) return;

    setSending(true);

    try {
      const res = await axios.post(
        `https://realtime-chat-application-bcwz.onrender.com/api/message/send/${selectedConversation?._id}`,
        {
          message: sendData,
        },
        {
          withCredentials: true,
        }
      );

     const data = res.data;

if (data.success === false) {
  console.log(data.message);
  setSending(false);
  return;
}

setMessages((prev) => {
  if (!Array.isArray(prev)) {
    return [data.newMessage];
  }

  return [...prev, data.newMessage];
});

setSendData("");
setSending(false);
    } catch (error) {
      console.log(error);
      setSending(false);
    }
  };

  // ================= Back =================

  const handleBack = () => {
    setSelectedConversation(null);

    if (setShowSidebar) {
      setShowSidebar(true);
    }
  };

  return (
    <div className="md:min-w-[500px] h-full flex flex-col py-2">

      {selectedConversation === null ? (

        <div className="flex items-center justify-center h-full">

          <div className="text-center">

            <p className="text-2xl font-bold">
              Welcome! 🙌 {authUser?.user?.username}
            </p>

            <p className="text-gray-500">
              Select a chat to start messaging
            </p>

            <TiMessages className="text-6xl text-sky-600 mx-auto mt-4" />

          </div>

        </div>

      ) : (

        <>

          {/* Header */}

          <div className="flex justify-between items-center bg-sky-600 rounded-lg px-4 py-3">

            <button
              onClick={handleBack}
              className="bg-white rounded-full p-2"
            >
              <IoArrowBackSharp size={22} />
            </button>

            <div className="flex items-center gap-3">

              <img
                src={selectedConversation?.profilepic}
                alt=""
                className="w-10 h-10 rounded-full"
              />

              <span className="text-white font-bold">
                {selectedConversation?.username}
              </span>

            </div>

            <div></div>

          </div>

          {/* Messages */}

       {/* Messages */}

<div className="flex-1 overflow-auto p-4">

  {loading ? (

    <div className="flex justify-center items-center h-full">
      Loading...
    </div>

  ) : messages?.length === 0 ? (

    <p className="text-center text-gray-500">
      Send a message to start conversation
    </p>

  ) : (

    Array.isArray(messages) &&
messages
  .filter((message) => message)
  .map((message) => (
        <div
          key={message?._id}
          ref={lastMessageRef}
          className={`chat ${
            message?.senderId === authUser?.user?._id
              ? "chat-end"
              : "chat-start"
          }`}
        >
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">

              <img
                src={
                  message?.senderId === authUser?.user?._id
                    ? authUser?.user?.profilepic
                    : selectedConversation?.profilepic
                }
                alt=""
              />

            </div>
          </div>

          <div
            className={`chat-bubble ${
              message?.senderId === authUser?.user?._id
                ? "bg-sky-600 text-white"
                : ""
            }`}
          >
            {message?.message}
          </div>

          <div className="chat-footer text-[10px] opacity-70">
            {message?.createdAt &&
              new Date(message.createdAt).toLocaleDateString("en-IN")}
            {" "}
            {message?.createdAt &&
              new Date(message.createdAt).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "numeric",
              })}
          </div>

        </div>

      ))

  )}

</div>

          {/* Send Message */}

          <form onSubmit={handleSubmit} className="p-2">

            <div className="flex items-center bg-white rounded-full px-3">

              <input
                type="text"
                value={sendData}
                onChange={handleMessage}
                placeholder="Type a message..."
                className="flex-1 py-3 outline-none"
              />

              <button type="submit">

                {sending ? (
                  <div className="loading loading-spinner"></div>
                ) : (
                  <IoSend
                    size={25}
                    className="text-sky-700 cursor-pointer"
                  />
                )}

              </button>

            </div>

          </form>

        </>

      )}

    </div>
  );
};

export default MessageContainer;