import React, { useEffect, useRef, useState } from "react";
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import axios from "axios";
import { useAuth } from "../../../Context/AuthContext";
import userConversation from "../../../Zustand/userConversation";
import Notification from "../../../notification/notification.wav";
import { useSocketContext } from "../../../Context/socketContext";
import { toast } from "react-toastify";
import { API_URL } from "../../../config/api";


const MessageContainer = ({ setShowSidebar }) => {
  const { authUser } = useAuth();

  const {
    messages,
    setMessages,
    selectedConversation,
    setSelectedConversation,
  } = userConversation();

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const { socket } = useSocketContext();
  const activeConversationRef = useRef(selectedConversation);
  activeConversationRef.current = selectedConversation;


  const lastMessageRef = useRef();


  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const senderId = String(newMessage?.senderId?._id ?? newMessage?.senderId);
      const activeUser = activeConversationRef.current;
      const isCurrentConversation = activeUser && String(activeUser._id) === senderId;

      window.dispatchEvent(new CustomEvent("chat:new-message", {
        detail: {
          userId: senderId,
          user: {
            _id: senderId,
            username: newMessage?.senderName || activeUser?.username,
            profilepic: newMessage?.senderProfilePic || activeUser?.profilepic,
          },
          message: newMessage,
          received: true,
        },
      }));

      if (isCurrentConversation) {
        setMessages((previous) => {
          const current = Array.isArray(previous) ? previous : [];
          if (current.some((message) => String(message?._id) === String(newMessage?._id))) return current;
          return [...current, newMessage];
        });
        axios.patch(`${API_URL}/api/message/read/${activeUser._id}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch(() => {});
      }

      const senderName = newMessage?.senderName || (isCurrentConversation ? activeUser.username : "Someone");
      toast.info(`New message from ${senderName}`, { toastId: `message-${newMessage?._id}` });

      const sound = new Audio(Notification);
      sound.play().catch(() => {});

      if (document.hidden && "Notification" in window && window.Notification.permission === "granted") {
        new window.Notification(`Message from ${senderName}`, {
          body: newMessage?.message,
          icon: newMessage?.senderProfilePic || activeUser?.profilepic,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
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
      const conversationId = String(selectedConversation._id);
      setLoading(true);
      setMessages([]);

      try {
        const res = await axios.get(
          `${API_URL}/api/message/${selectedConversation?._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = res.data;

        if (!data.success) {
          if (String(activeConversationRef.current?._id) === conversationId) setMessages([]);
          setLoading(false);
          return;
        }

        if (String(activeConversationRef.current?._id) !== conversationId) {
          setLoading(false);
          return;
        }
        const fetchedMessages = Array.isArray(data.messages) ? data.messages : [];
        setMessages((current) => {
          const byId = new Map(fetchedMessages.map((message) => [String(message?._id), message]));
          (Array.isArray(current) ? current : []).forEach((message) => byId.set(String(message?._id), message));
          return [...byId.values()];
        });

        setLoading(false);
      } catch (error) {
        if (String(activeConversationRef.current?._id) === conversationId) setMessages([]);
        setLoading(false);
      }
    };

    if (selectedConversation?._id) {
      getMessages();
    } else {
      setMessages([]);
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
        `${API_URL}/api/message/send/${selectedConversation?._id}`,
        {
          message: sendData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = res.data;

      if (data.success === false) {
        setSending(false);
        return;
      }

      setMessages((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        if (current.some((message) => String(message?._id) === String(data.newMessage?._id))) return current;
        return [...current, data.newMessage];
      });

      window.dispatchEvent(new CustomEvent("chat:new-message", {
        detail: {
          userId: String(selectedConversation._id),
          user: selectedConversation,
          message: data.newMessage,
          received: false,
        },
      }));

      setSendData("");
      setSending(false);
    } catch (error) {
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
    <div className="w-full min-w-0 h-full flex flex-col p-3 sm:p-4">

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

          <div className="flex justify-between items-center bg-sky-700 rounded-xl px-4 py-3 shadow-sm shrink-0">

            <button
              onClick={handleBack}
              aria-label="Back to conversations"
              className="bg-white text-sky-700 rounded-full p-2 hover:bg-sky-50 transition-colors"
            >
              <IoArrowBackSharp size={22} />
            </button>

            <div className="flex items-center gap-3">

              <img
                src={selectedConversation?.profilepic}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
              />

              <span className="text-white font-bold">
                {selectedConversation?.username}
              </span>

            </div>

            <div></div>

          </div>

          {/* Messages */}

          {/* Messages */}

          <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-5 chat-scrollbar">

            {loading ? (

              <div className="flex justify-center items-center h-full text-slate-500">
                Loading messages…
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
                    className={`chat ${message?.senderId === authUser?.user?._id
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
                      className={`max-w-[min(78%,34rem)] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 shadow-sm ${message?.senderId === authUser?.user?._id
                          ? "bg-sky-700 text-white rounded-br-md"
                          : "bg-white text-slate-900 border border-slate-200 rounded-bl-md"
                        }`}
                    >
                      {message?.message}
                    </div>

                    <div className="chat-footer text-[11px] text-slate-500">
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

          <form onSubmit={handleSubmit} className="pt-3 shrink-0">

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-sky-200 focus-within:border-sky-400">

              <input
                type="text"
                value={sendData}
                onChange={handleMessage}
                placeholder="Type a message..."
                aria-label="Type a message"
                className="flex-1 min-w-0 py-3 outline-none bg-transparent text-slate-900 placeholder:text-slate-500"
              />

              <button type="submit" disabled={sending || !sendData.trim()} aria-label="Send message" className="p-2 disabled:opacity-40 disabled:cursor-not-allowed">

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
