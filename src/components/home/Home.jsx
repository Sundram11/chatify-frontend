import React, { useState, useCallback } from "react";
import Sidebar from "../sidebar/Sidebar.jsx";
import ChatTab from "../chatTab/ChatTab.jsx";
import Footer from "../footer/Footer.jsx";
import chatService from "../../backendServices/chat.js";

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [localMessageEvent, setLocalMessageEvent] = useState(null);

  const handleSelectChat = useCallback((chat) => setSelectedChat(chat), []);
  const handleMessageSent = useCallback(
    (event) => setLocalMessageEvent(event),
    []
  );

  // 🟩 Open chat directly from user
  const handleOpenChatWithUser = useCallback(async (user) => {
    try {
      const chat = await chatService.createOrGetOneToOneChat(user._id);
      const chatData = {
        ...chat.data,
        friend: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic,
        },
      };
      setSelectedChat(chatData);
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  }, []);

  return (
    <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* ============== DESKTOP ============== */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* 🟩 Sidebar fills full height */}
        <aside className="flex h-full w-1/2lg:w-96 border-r border-gray-200 dark:border-gray-800">
          {/* Footer stays pinned bottom */}
          <div className="shrink-0">
            <Footer />
          </div>
          {/* Sidebar scrolls internally */}
          <div className="flex-1 overflow-y-auto">
            <Sidebar
              onSelectChat={handleSelectChat}
              onOpenChatWithUser={handleOpenChatWithUser}
              selectedChatId={selectedChat?._id}
              localMessageEvent={localMessageEvent}
            />
          </div>
        </aside>

        {/* 🟩 Chat Area */}
        <main className="flex-1 h-full overflow-hidden">
          {selectedChat ? (
            <ChatTab chat={selectedChat} onMessageSent={handleMessageSent} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </main>
      </div>

      {/* ============== MOBILE ============== */}
      {/* ============== MOBILE ============== */}
{/* ============== MOBILE ============== */}
<div className="flex md:hidden h-full overflow-hidden">
  {!selectedChat ? (
    <div className="flex flex-row h-full w-full">
      {/* Footer on the right side */}
      <div className="w-16 flex-shrink-0 border-l border-gray-800 bg-gray-950 flex flex-col items-center justify-between py-4">
        <Footer />
      </div>

      {/* Sidebar area */}
      <div className="flex-1 overflow-y-auto">
        <Sidebar
          onSelectChat={handleSelectChat}
          onOpenChatWithUser={handleOpenChatWithUser}
          selectedChatId={selectedChat?._id}
          localMessageEvent={localMessageEvent}
        />
      </div>
    </div>
  ) : (
    <div className="flex-1 w-full">
      <ChatTab
        chat={selectedChat}
        onMessageSent={handleMessageSent}
        onBack={() => setSelectedChat(null)}
      />
    </div>
  )}
</div>


    </div>
  );
};

export default ChatLayout;
