import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import userConversation from "../../../Zustand/userConversation";
import { useSocketContext } from "../../../Context/socketContext";

const Sidebar = ({ setShowSidebar }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();

    const [searchInput, setSearchInput] = useState("");
    const [searchUser, setSearchUser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { selectedConversation, setSelectedConversation, messages } = userConversation();
    const { onlineUsers, socket } = useSocketContext();
    useEffect(() => {
        console.log("Online Users:", onlineUsers);
        console.log("Chat Users:", chatUser);
    }, [onlineUsers, chatUser]);




    //logout

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");

        if (confirmLogout) {
            localStorage.removeItem("chatapp");
            setAuthUser(null);
            navigate("/login");
        } else {
            toast.info("Logout cancelled");
        }
    };

    // current chatters

    useEffect(() => {
        const chatUserHandler = async () => {
            setLoading(true);

            try {
                const res = await axios.get(
                    "https://realtime-chat-application-bcwz.onrender.com/api/user/currentchatters",
                    {
                        withCredentials: true,
                    }
                );
                console.log(res.data);

                const data = res.data;


                if (!data.success) {
                    toast.error(data.message);
                    setLoading(false);
                    return;
                }

                setChatUser(data.users);
                setLoading(false);
            } catch (error) {
    setLoading(false);

    

}
        };

        chatUserHandler();
    }, []);

    // ================= Search User =================

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const res = await axios.get(
                `https://realtime-chat-application-bcwz.onrender.com/api/user/search?search=${searchInput}`,
                {
                    withCredentials: true,
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
        setSelectedUserId(user._id);

        // Clear search
        setSearchInput("");
        setSearchUser([]);

        // Hide sidebar on mobile
        if (setShowSidebar) {
            setShowSidebar(false);
        }
    };

    return (
        <div className="h-full flex flex-col">

            {/* Search Bar */}

            <div className="p-4 flex items-center gap-3">

                <form
                    onSubmit={handleSearchSubmit}
                    className="flex flex-1 items-center bg-white rounded-full shadow-md overflow-hidden"
                >
                    <input
                        type="text"
                        placeholder="Search User"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-1 px-5 py-3 outline-none bg-transparent"
                    />

                    <button
                        type="submit"
                        className="w-14 h-14 bg-sky-700 hover:bg-sky-800 text-white flex justify-center items-center"
                    >
                        <FaSearch />
                    </button>
                </form>

                <img

                    src={authUser?.user?.profilepic}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-110 transition"
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
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-sky-100 transition ${selectedConversation?._id === user._id
                                        ? "bg-sky-600 text-white"
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
                                        <p className="text-sm text-gray-500">
                                            {user.fullname}
                                        </p>
                                    </div>

                                </div>

                                <div className="divider my-0 px-3"></div>

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
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-sky-100 transition ${selectedUserId === user._id ? "bg-sky-600 text-white" : ""
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative w-12 h-12">
                                        <img
                                            src={user.profilepic}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        {
                                            console.log(
                                                "Username:", user.username,
                                                "User ID:", user._id,
                                                "Online Users:", onlineUsers,
                                                "Is Online:", onlineUsers.includes(user._id.toString())
                                            )
                                        }


                                        {onlineUsers.includes(user._id.toString()) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex flex-col">
                                        <p className="font-semibold">{user.username}</p>
                                        <p className="text-sm text-gray-500">{user.fullname}</p>
                                    </div>
                                </div>

                                <div className="divider my-0 px-3"></div>
                            </div>
                        ))}
                    </>
                )}

            </div>

            {/* Logout */}

            <div className="mt-auto px-4 py-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-all cursor-pointer"
                >
                    <BiLogOut size={22} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;