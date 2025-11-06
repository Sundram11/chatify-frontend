import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import messageService from "../../backendServices/messages.js";
import useUnreadCounts from "../../sockets/useUnreadCounts.jsx";
import SearchBar from "../search/SearchBar.jsx";
import ChatParticipant from "./ChatParticipants.jsx";

const Sidebar = ({
  onSelectChat,
  selectedChatId,
  localMessageEvent,
  onOpenChatWithUser, // 🟩 added prop for direct chat open
}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useSelector((s) => s.auth);
  const mode = useSelector((s) => s.theme.mode);

  // ─────────────── reorder on local message
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

  // ─────────────── load recent chats
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
    loadChats();
  }, [loadChats]);

  // ─────────────── reorder on socket message
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

  // ─────────────── unread count hook
  const { unreadMap } = useUnreadCounts(
    selectedChatId,
    accessToken,
    user?._id,
    handleSocketMessage
  );

  // ─────────────── helpers
  const formatTime = (ts) => {
    if (!ts) return "";
    const d = dayjs(ts);
    const now = dayjs();
    const diff = now.diff(d, "day");
    if (diff === 0) return d.format("h:mm A");
    if (diff === 1) return "Yesterday";
    return d.format("DD/MM/YY");
  };

  // ─────────────── render
  return (
    <div
      className={`flex flex-col h-full transition-colors duration-300 ${
        mode === "dark" ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* 🔹 Header */}
      <div className="p-4 border-b border-gray-800 flex flex-col gap-3 sticky top-0 z-10 bg-inherit">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">ChatApp</h1>
        </div>
        <SearchBar onOpenChatWithUser={onOpenChatWithUser} /> {/* 🟩 pass it down */}
      </div>

      {/* 🔹 Chat list */}
      <div className="flex-1 overflow-y-auto p-4">
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
                <ChatParticipant
                  key={chat._id}
                  chat={chat}
                  unread={unread}
                  selected={selected}
                  onSelectChat={onSelectChat}
                  formatTime={formatTime}
                />
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No chats found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
