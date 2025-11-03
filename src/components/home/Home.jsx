import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar.jsx";
import ChatTab from "../chatTab/ChatTab.jsx";
import { useSelector } from "react-redux";
import Header from "../header/Header.jsx";

const HomePage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [selectedChat, setSelectedChat] = useState(null);

  const handleSelectChat = (chat) => {
    if (window.innerWidth < 768) {
      navigate(`/chat/${chat._id}`, { state: { chat } });
    } else {
      setSelectedChat(chat);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      {/* Main content: sidebar + chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-1/4 border-r border-gray-800 overflow-y-auto">
          <Sidebar onSelectChat={handleSelectChat} />
        </div>

        {/* Chat tab */}
        <div className="flex-1 overflow-y-auto">
          <ChatTab key={chatId} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
