import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { Bs1CircleFill } from "react-icons/bs";
import messageService from "../../backendServices/messages.js";
import useUnreadCounts from "../../sockets/useUnreadCounts.jsx";

const Sidebar = () => {
  const navigate = useNavigate();
  const { chatId: currentChatId } = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useSelector((state) => state.auth);

  // Load recent chats
  const loadChats = useCallback(async () => {
    try {
      const res = await messageService.getRecentChats();
      const sorted = (res?.data || []).sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
      setChats(sorted);
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reorder chat on new message
  const handleSocketMessage = useCallback((chatId, message) => {
    setChats((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((c) => c._id === chatId);

      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          lastMessageTime: new Date().toISOString(),
        };
        const [chat] = updated.splice(index, 1);
        updated.unshift(chat);
      } else {
        updated.unshift({
          _id: chatId,
          lastMessageTime: new Date().toISOString(),
        });
      }
      return updated;
    });
  }, []);

  // Unread counts + socket
  const unreadMap = useUnreadCounts(
    currentChatId,
    accessToken,
    user?._id,
    handleSocketMessage
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = dayjs();
    const msgTime = dayjs(timestamp);
    const diffDays = now.diff(msgTime, "day");

    if (diffDays === 0) return msgTime.format("h:mm A");
    if (diffDays === 1) return "Yesterday";
    return msgTime.format("DD/MM/YY");
  };

  const handleSelectChat = (chat) => {
    navigate(`/chat/${chat._id}`, { state: { chat } });
  };

  const isUnreadReady = unreadMap !== null && typeof unreadMap === "object";

  return (
    <div className="h-full overflow-y-auto p-4 bg-gray-900">
      <h2 className="text-xl font-semibold mb-4 text-white">Chats</h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="w-24 h-3 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : chats.length > 0 ? (
        <ul className="space-y-2">
          {chats.map((chat) => {
            const hasUnread = isUnreadReady && unreadMap[chat._id]?.hasUnread;
            const isUnread = !!hasUnread;

            return (
              <li
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`flex items-center p-2 rounded-xl hover:bg-gray-800 cursor-pointer transition relative ${
                  currentChatId === chat._id ? "bg-gray-800" : ""
                }`}
              >
                {/* Avatar */}
                {chat.isGroup ? (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {chat.name?.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img
                    src={chat.friend?.profilePic || "/profileImage.png"}
                    alt="no profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}

                {/* Chat info */}
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <p
                      className={`font-medium ${
                        isUnread ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {chat.name || chat.friend?.fullName}
                    </p>
                    <span
                      className={`text-xs ${
                        isUnread ? "text-blue-500" : "text-gray-500"
                      }`}
                    >
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>

                  {/* Message status */}
                  {isUnread && (
                    <div className="flex items-center justify-end mr-3">
                      <Bs1CircleFill
                        size={20}
                        className="text-blue-500"
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No chats found</p>
      )}
    </div>
  );
};

export default Sidebar;
