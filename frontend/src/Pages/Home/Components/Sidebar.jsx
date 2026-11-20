import React, { useCallback, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import userConversation from "../../../Zustand/userConversation";
import { useSocketContext } from "../../../Context/socketContext";
import { API_URL } from "../../../config/api";

const Sidebar = ({ setShowSidebar }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();

    const [searchInput, setSearchInput] = useState("");
    const [searchUser, setSearchUser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { selectedConversation, setSelectedConversation, setMessages } = userConversation();
    const { onlineUsers } = useSocketContext();




    //logout

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");

        if (confirmLogout) {
            setSelectedConversation(null);
            setMessages([]);
            localStorage.removeItem("token");
            localStorage.removeItem("chatapp");

            setAuthUser(null);

            navigate("/login");
        } else {
            toast.info("Logout cancelled");
        }
    };
    // current chatters

    const loadChatUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/user/currentchatters`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!res.data.success) {
                toast.error(res.data.message);
                return;
            }
            setChatUser(res.data.users);
        } catch (error) {
            console.error("Unable to load conversations:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChatUsers();
    }, [loadChatUsers]);

    useEffect(() => {
        const handleChatMessage = (event) => {
            const { userId, user, message, received } = event.detail || {};
            if (!userId || !message) return;
            const openConversationId = userConversation.getState().selectedConversation?._id;
            const isOpen = String(openConversationId) === String(userId);

            setChatUser((currentUsers) => {
                const existingUser = currentUsers.find((item) => String(item._id) === String(userId));
                const updatedUser = {
                    ...(existingUser || user || { _id: userId }),
                    lastMessage: message.message,
                    lastMessageAt: message.createdAt,
                    unreadCount: Math.max(0, existingUser?.unreadCount || 0) + (received && !isOpen ? 1 : 0),
                };
                return [updatedUser, ...currentUsers.filter((item) => String(item._id) !== String(userId))];
            });
        };

        window.addEventListener("chat:new-message", handleChatMessage);
        return () => window.removeEventListener("chat:new-message", handleChatMessage);
    }, []);

    // ================= Search User =================

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await axios.get(
                `${API_URL}/api/user/search?search=${encodeURIComponent(searchInput)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = res.data;

            if (!data.success) {
                toast.error(data.message);
                setLoading(false);
                return;
            }

            if (data.users.length === 0) {
                toast.info("No User Found");
                setSearchUser([]);
            } else {
                setSearchUser(data.users);
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    // ================= Select User =================
    const handleUserClick = (user) => {
        setSelectedConversation(user);
        setMessages([]);
        setSelectedUserId(user._id);
        setChatUser((currentUsers) => currentUsers.map((chat) =>
            String(chat._id) === String(user._id) ? { ...chat, unreadCount: 0 } : chat
        ));
        axios.patch(`${API_URL}/api/message/read/${user._id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch((error) => console.error("Unable to mark chat as read:", error));

        // Clear search
        setSearchInput("");
        setSearchUser([]);

        // Hide sidebar on mobile
        if (setShowSidebar) {
            setShowSidebar(false);
        }
    };

    return (
        <div className="h-full flex flex-col text-slate-800">
{/* Search Bar */}

<div className="p-4 flex items-center gap-2">

    <form
        onSubmit={handleSearchSubmit}
                className="flex flex-1 items-center bg-slate-50 border border-slate-200 rounded-full shadow-sm overflow-hidden min-w-0 focus-within:ring-2 focus-within:ring-sky-300"
    >
        <input
            type="text"
            placeholder="Search User"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2.5 outline-none bg-transparent text-slate-900 placeholder:text-slate-500"
        />

        <button
            type="submit"
            aria-label="Search users"
            className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-700 hover:bg-sky-800 text-white flex items-center justify-center flex-shrink-0 transition-colors"
        >
            <FaSearch />
        </button>
    </form>

    <img
        src={authUser?.user?.profilepic}
        alt="Profile"
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
    />

</div>

            <div className="divider px-3"></div>

            {/* User List */}

            <div className="flex-1 overflow-y-auto scrollbar">

                {searchUser.length > 0 ? (
                    <>
                        {searchUser.map((user) => (

                            <div key={user._id}>

                                <div
                                    onClick={() => handleUserClick(user)}
                                    className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer hover:bg-sky-50 transition ${selectedConversation?._id === user._id
                                        ? "bg-sky-700 text-white hover:bg-sky-800"
                                        : ""
                                        }`}
                                >
                                    <div className="relative w-12 h-12">
                                        <img
                                            src={user.profilepic}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                        {onlineUsers.includes(user._id.toString()) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="font-semibold">{user.username}</p>
                                        <p className={`text-sm ${selectedConversation?._id === user._id ? "text-sky-100" : "text-slate-500"}`}>
                                            {user.fullname}
                                        </p>
                                    </div>

                                </div>

                                <div className="my-1 border-b border-slate-100 mx-4"></div>

                            </div>
                        ))}

                        {/* Back Button */}

                        <div className="px-4 py-3">
                            <IoIosArrowRoundBack
                                size={32}
                                className="cursor-pointer hover:text-sky-600"
                                onClick={() => {
                                    setSearchUser([]);
                                    setSearchInput("");
                                }}
                            />
                        </div>

                    </>
                ) : (
                    <>
                        {chatUser.map((user) => (
                            <div key={user._id}>
                                <div
                                    onClick={() => handleUserClick(user)}
                                    className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer hover:bg-sky-50 transition ${selectedUserId === user._id ? "bg-sky-700 text-white hover:bg-sky-800" : ""
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative w-12 h-12">
                                        <img
                                            src={user.profilepic}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        {onlineUsers.includes(user._id.toString()) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className={user.unreadCount ? "font-bold" : "font-semibold"}>{user.username}</p>
                                        <p className={`text-sm truncate ${user.unreadCount ? "font-semibold" : "font-normal"} ${selectedUserId === user._id ? "text-sky-100" : user.unreadCount ? "text-slate-800" : "text-slate-500"}`}>
                                            {user.lastMessage || user.fullname}
                                        </p>
                                    </div>
                                    {user.unreadCount > 0 && (
                                        <span className={`min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-xs font-bold ${selectedUserId === user._id ? "bg-white text-sky-700" : "bg-emerald-500 text-white"}`}>
                                            {user.unreadCount > 99 ? "99+" : user.unreadCount}
                                        </span>
                                    )}
                                </div>

                                <div className="my-1 border-b border-slate-100 mx-4"></div>
                            </div>
                        ))}
                    </>
                )}

            </div>

            {/* Logout */}

            <div className="mt-auto px-4 py-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-all cursor-pointer"
                >
                    <BiLogOut size={22} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
