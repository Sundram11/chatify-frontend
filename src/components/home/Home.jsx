import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../sidebar/Sidebar.jsx";
import ChatTab from "../chatTab/ChatTab.jsx";
import { useOutletContext } from "react-router-dom";

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [localMessageEvent, setLocalMessageEvent] = useState(null);

  // ✅ Access footer visibility control from parent (App)
  const { setFooterVisible } = useOutletContext();

  // 🟩 Handle responsive footer visibility (mobile only)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setFooterVisible(!selectedChat);
      } else {
        setFooterVisible(true);
      }
    };

    handleResize(); // initial run
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedChat, setFooterVisible]);

  // 🟦 Callbacks
  const handleSelectChat = useCallback((chat) => setSelectedChat(chat), []);
  const handleMessageSent = useCallback(
    (event) => setLocalMessageEvent(event),
    []
  );

  return (
    <div className="h-[calc(100vh-56px)] bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* 💻 Desktop View */}
      <div className="hidden md:flex h-full">
        {/* Sidebar */}
        <aside className="w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <Sidebar
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChat?._id}
            localMessageEvent={localMessageEvent}
          />
        </aside>

        {/* Chat Tab */}
        <main className="flex-1">
          {selectedChat ? (
            <ChatTab chat={selectedChat} onMessageSent={handleMessageSent} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center select-none">
              Select a chat to start messaging 💬
            </div>
          )}
        </main>
      </div>

      {/* 📱 Mobile View */}
      <div className="flex md:hidden h-full transition-all duration-300">
        {!selectedChat ? (
          <Sidebar
            onSelectChat={handleSelectChat}
            selectedChatId={selectedChat?._id}
            localMessageEvent={localMessageEvent}
          />
        ) : (
          <ChatTab
            chat={selectedChat}
            onMessageSent={handleMessageSent}
            onBack={() => setSelectedChat(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
