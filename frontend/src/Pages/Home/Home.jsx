import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";
import MessageContainer from "./Components/MessageContainer";

const Home = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-200">

      <div className="w-[95%] h-[95vh] bg-white rounded-xl shadow-xl overflow-hidden flex">

        {/* Sidebar */}
        <div
          className={`
            ${showSidebar ? "block" : "hidden"}
            md:block
            w-full md:w-[32%]
            border-r
          `}
        >
          <Sidebar setShowSidebar={setShowSidebar} />
        </div>

        {/* Message Container */}
        <div
          className={`
            ${showSidebar ? "hidden" : "block"}
            md:block
            flex-1
          `}
        >
          <MessageContainer setShowSidebar={setShowSidebar} />
        </div>

      </div>

    </div>
  );
};

export default Home;