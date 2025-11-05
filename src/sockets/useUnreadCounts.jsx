// sockets/useUnreadCounts.jsx
import { useEffect, useState, useCallback } from "react";
import { getSocket, connectSocket } from "../socket.js";
import { ChatEventEnum } from "../constant.js";
import toast from "react-hot-toast";
import messageService from "../backendServices/messages.js";

const useUnreadCounts = (currentChatId, token, userId, onReorderChat) => {
  const [unreadMap, setUnreadMap] = useState({});

  // Load initial
  useEffect(() => {
    if (!token || !userId) return;

    const load = async () => {
      try {
        const { data } = await messageService.getUnreadCounts();
        const apiData = data?.data || {};
        const filtered = {};
        Object.values(apiData).forEach((item) => {
          if (item.senderId !== userId) {
            filtered[item.chatId] = { hasUnread: true, senderId: item.senderId };
          }
        });
        setUnreadMap(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [token, userId]);

  // Socket updates
  useEffect(() => {
    if (!token || !userId) return;
    let socket = getSocket();
    if (!socket) socket = connectSocket(token);

    const handle = ({ chatId, senderId, message }) => {
      if (senderId === userId) return;
      setUnreadMap((prev) => {
        const upd = { ...prev };
        if (chatId === currentChatId) {
          delete upd[chatId];
        } else {
          upd[chatId] = { hasUnread: true, senderId };
          toast(<div>New message</div>, { duration: 3000 });
        }
        return upd;
      });
      onReorderChat?.(chatId, message);
    };

    socket.on(ChatEventEnum.UNREAD_COUNT_UPDATE, handle);
    return () => socket.off(ChatEventEnum.UNREAD_COUNT_UPDATE, handle);
  }, [token, userId, currentChatId, onReorderChat]);

  // Clear on open
  useEffect(() => {
    if (!currentChatId) return;
    setUnreadMap((prev) => {
      const upd = { ...prev };
      delete upd[currentChatId];
      return upd;
    });
  }, [currentChatId]);

  const clearUnread = useCallback((chatId) => {
    setUnreadMap((prev) => {
      const upd = { ...prev };
      delete upd[chatId];
      return upd;
    });
  }, []);

  return { unreadMap, clearUnread };
};

export default useUnreadCounts;