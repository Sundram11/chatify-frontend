import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import messageService from "../../backendServices/messages.js";
import dayjs from "dayjs";

const Sidebar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);

const loadChats = async () => {
      try {
        const res = await messageService.getRecentChats();
        console.log(res);
        setChats(res?.data || []);
      } catch (err) {
        console.error("❌ Error loading chats:", err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    
    loadChats();
  }, []);

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
     console.log("inside bar",chat)
    navigate(`/chat/${chat._id}`, { state: { chat } });
  };

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
          {chats.map((chat) => (
            <li
              key={chat._id}
              onClick={() => handleSelectChat(chat)}
              className="flex items-center p-2 rounded-xl hover:bg-gray-800 cursor-pointer transition"
            >
              {/* Avatar */}
              {chat.isGroup ? (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {chat.name?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src={chat.friend?.profilePic || "/default-avatar.png"}
                  alt={chat.friend?.fullName?.charAt(0)}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}

              {/* Chat Info */}
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-white">
                    {chat.name || chat.friend?.fullName}
                    
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No chats found</p>
      )}
    </div>
  );
};

export default Sidebar;
