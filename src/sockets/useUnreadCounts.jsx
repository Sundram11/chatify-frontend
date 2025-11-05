// sockets/useUnreadCounts.jsx
import { useEffect, useState } from "react";
import { getSocket, connectSocket } from "../socket.js";
import { ChatEventEnum } from "../constant.js";
import toast from "react-hot-toast";
import messageService from "../backendServices/messages.js";

const useUnreadCounts = (currentChatId, token, userId, onSocketMessage) => {
  const [unreadMap, setUnreadMap] = useState({}); // { chatId: { hasUnread, senderId } }

  // 1. FETCH UNREAD ON MOUNT (only from others)
  useEffect(() => {
    if (!token || !userId) return;

    (async () => {
      try {
        const res = await messageService.getUnreadCounts();
        // res.data.data = { "0": {chatId, hasUnread, senderId}, ... }
        const apiData = res?.data?.data || {};

        const filtered = {};
        Object.values(apiData).forEach((item) => {
          if (item.senderId !== userId) {
            filtered[item.chatId] = {
              hasUnread: true,
              senderId: item.senderId,
            };
          }
        });

        setUnreadMap(filtered);
        // NO TOAST HERE — only real-time
      } catch (err) {
        console.error("Failed to load unread counts:", err);
      }
    })();
  }, [token, userId]);

  // 2. REAL-TIME SOCKET UPDATES
  useEffect(() => {
    if (!token || !userId) return;

    let socket = getSocket();
    if (!socket) socket = connectSocket(token);

    const handleUnread = ({ chatId, senderId, message }) => {
      if (senderId === userId) return; // ignore my own messages

      setUnreadMap((prev) => {
        const updated = { ...prev };

        if (chatId === currentChatId) {
          // I'm viewing this chat → mark as read
          delete updated[chatId];
        } else {
          updated[chatId] = { hasUnread: true, senderId };
          toast(
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>New message</span>
            </div>,
            { duration: 3000, position: "top-right" }
          );

          if (typeof onSocketMessage === "function") {
            onSocketMessage(chatId, message);
          }
        }
        return updated;
      });
    };

    socket.on(ChatEventEnum.UNREAD_COUNT_UPDATE, handleUnread);
    return () => socket.off(ChatEventEnum.UNREAD_COUNT_UPDATE, handleUnread);
  }, [token, currentChatId, userId, onSocketMessage]);

  // 3. CLEAR UNREAD WHEN CHAT IS OPENED
  useEffect(() => {
    if (!currentChatId) return;
    setUnreadMap((prev) => {
      const updated = { ...prev };
      delete updated[currentChatId];
      return updated;
    });
  }, [currentChatId]);

  return unreadMap;
};

export default useUnreadCounts;