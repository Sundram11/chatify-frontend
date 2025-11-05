import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { Bs1CircleFill } from "react-icons/bs";
import messageService from "../../backendServices/messages.js";
import useUnreadCounts from "../../sockets/useUnreadCounts.jsx";

const Sidebar = ({ onSelectChat, selectedChatId, localMessageEvent }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useSelector((s) => s.auth);
  const mode = useSelector((s) => s.theme.mode); // theme

  // ────────────────────────────────────── local message → reorder
  useEffect(() => {
    if (!localMessageEvent) return;
    const { chatId, createdAt } = localMessageEvent;
    setChats((prev) => {
      const idx = prev.findIndex((c) => c._id === chatId);
      if (idx === -1) return prev;
      const chat = { ...prev[idx], lastMessageTime: createdAt };
      return [chat, ...prev.filter((_, i) => i !== idx)];
    });
  }, [localMessageEvent]);

  // ────────────────────────────────────── load recent chats
  const loadChats = useCallback(async () => {
    try {
      const { data } = await messageService.getRecentChats();
      const sorted = (data || []).sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
      setChats(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // ✅ define async inside effect
    const fetchChats = async () => {
      await loadChats();
    };
    fetchChats();
  }, [loadChats]);

  // ────────────────────────────────────── socket reorder
  const handleSocketMessage = useCallback((chatId, message) => {
    setChats((prev) => {
      const idx = prev.findIndex((c) => c._id === chatId);
      const time = message?.createdAt ?? new Date().toISOString();

      const updated =
        idx === -1
          ? [
              {
                _id: chatId,
                name: message?.senderName || "New Chat",
                lastMessageTime: time,
              },
              ...prev,
            ]
          : prev.map((c, i) =>
              i === idx ? { ...c, lastMessageTime: time } : c
            );

      return updated.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
    });
  }, []);

  // **THIS IS THE ONLY LINE THAT CALLS THE UNREAD HOOK**
  const { unreadMap } = useUnreadCounts(
    selectedChatId,
    accessToken,
    user?._id,
    handleSocketMessage
  );

  // ────────────────────────────────────── helpers
  const formatTime = (ts) => {
    if (!ts) return "";
    const d = dayjs(ts);
    const now = dayjs();
    const diff = now.diff(d, "day");
    if (diff === 0) return d.format("h:mm A");
    if (diff === 1) return "Yesterday";
    return d.format("DD/MM/YY");
  };

  // ────────────────────────────────────── render
  return (
    <div
      className={`
        h-full overflow-y-auto p-4
        ${mode === "dark" ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"}
        transition-colors duration-300
      `}
    >
      <div className="text-xl font-semibold mb-4 tracking-wide">Chats</div>

      {/* skeletons */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="w-24 h-3 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : chats.length > 0 ? (
        <ul className="space-y-1">
          {chats.map((chat) => {
            const unread = unreadMap?.[chat._id]?.hasUnread;
            const selected = selectedChatId === chat._id;

            return (
              <li
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`
                  flex items-center p-2 rounded-xl cursor-pointer transition relative select-none
                  ${selected ? "bg-gray-800 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                  ${unread ? "ring-1 ring-blue-500/40" : ""}
                `}
              >
                {/* avatar */}
                {chat.isGroup ? (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {chat.name?.[0].toUpperCase()}
                  </div>
                ) : (
                  <img
                    src={chat.friend?.profilePic || "/profileImage.png"}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />
                )}

                {/* details */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p
                      className={`font-medium truncate ${
                        unread
                          ? "text-white dark:text-white"
                          : "text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {chat.name || chat.friend?.fullName}
                    </p>
                    <span
                      className={`text-xs shrink-0 ${
                        unread ? "text-blue-400" : "text-gray-500"
                      }`}
                    >
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                </div>

                {/* unread dot */}
                {unread && (
                  <Bs1CircleFill
                    size={14}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-blue-400 drop-shadow-sm"
                  />
                )}
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
