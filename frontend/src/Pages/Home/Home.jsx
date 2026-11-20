import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import MessageContainer from "./Components/MessageContainer";
import { useAuth } from "../../Context/AuthContext";
import userConversation from "../../Zustand/userConversation";

const Home = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const { authUser } = useAuth();
  const { setSelectedConversation, setMessages } = userConversation();

  useEffect(() => {
    setSelectedConversation(null);
    setMessages([]);
    setShowSidebar(true);
  }, [authUser?.user?._id, setMessages, setSelectedConversation]);

  return (
    <main className="min-h-screen w-full flex justify-center items-center bg-slate-100 p-0 md:p-5">

      <div className="w-full h-screen md:h-[min(92vh,900px)] md:w-[min(1500px,96vw)] bg-white md:rounded-2xl shadow-xl overflow-hidden flex">

        {/* Sidebar */}
        <div
          className={`
            ${showSidebar ? "block" : "hidden"}
            md:block
            w-full md:w-[320px] lg:w-[360px] shrink-0
            border-r border-slate-200 bg-white
          `}
        >
          <Sidebar setShowSidebar={setShowSidebar} />
        </div>

        {/* Message Container */}
        <div
          className={`
            ${showSidebar ? "hidden" : "block"}
            md:block
            flex-1 min-w-0 bg-slate-50
          `}
        >
          <MessageContainer setShowSidebar={setShowSidebar} />
        </div>

      </div>

    </main>
  );
};

export default Home;
