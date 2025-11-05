import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
  useMemo,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, shallowEqual } from "react-redux";
import Message from "../messagefomat/MessageFormat.jsx";
import messageService from "../../backendServices/messages.js";
import useChatSocket from "../../sockets/ChatTabSocket.jsx";
import ChatHeader from "./ChatHeader.jsx";
import ChatInput from "./ChatInput.jsx";

const PAGE_SIZE = 15;

const ChatTab = memo(() => {
  const { chatId } = useParams();
  const location = useLocation();

  const { accessToken: token, user: currentUser } = useSelector(
    (s) => ({ accessToken: s.auth.accessToken, user: s.auth.user }),
    shallowEqual
  );

  const chat = useMemo(() => location.state?.chat, [location.state]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef(null);
  const endRef = useRef(null);
  const shouldAutoScroll = useRef(true);
  const isPrepending = useRef(false);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const prevMsgCount = useRef(0);
  const pageRef = useRef(1);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  /* 🔵 Mark as read helper */
  const markAsRead = useCallback(async ({ chatId, receiverId }) => {
    try {
      await messageService.readMessages({ chatId, receiverId });
      // no need to await response payload here; socket will update UI
    } catch (err) {
      // swallow, not critical
      console.error("❌ markAsRead failed", err);
    }
  }, []);

  /* Load Messages */
  const loadMessages = useCallback(
    async (p = 1, prepend = false) => {
      if (!chatId || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const { data } = await messageService.getMessages(chatId, p, PAGE_SIZE);
        const newMsgs = data?.messages || [];

        setMessages((prev) => {
          const merged = prepend
            ? [...newMsgs, ...prev]
            : [...prev, ...newMsgs];
          setHasMore(data?.pagination?.hasMore ?? false);
          return merged;
        });

        // Mark unread messages (sent by friend) as read — only after messages loaded
        // guard: chat.friend may be object or id
        const friendId = chat?.friend?._id ?? chat?.friend;
        if (friendId) {
          markAsRead({ chatId, receiverId: friendId });
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [chatId, chat?.friend, markAsRead]
  );

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    setHasMore(true);
    pageRef.current = 1;
    loadMessages(1);
  }, [chatId, loadMessages]);

  /* 🟥 Delete Message */
  const handleDeleteMessage = useCallback(async (messageId) => {
  
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("❌ Delete message failed:", err);
    }
  }, []);

  /* 🟦 Edit Message */
 const handleEditMessage = useCallback(async (messageId, newText) => {
  try {
    const { data } = await messageService.editMessage(messageId, newText);
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId ? { ...m, ...data, isEdited: true } : m
      )
    );
  } catch (err) {
    console.error("❌ Edit message failed:", err);
  }
}, []);


  /* Scroll Logic */
  const scrollToBottom = useCallback((behavior = "auto") => {
    endRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || loadingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearTop = scrollTop < 120;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    shouldAutoScroll.current = isNearBottom;

    if (isNearTop && hasMoreRef.current) {
      const prevHeight = container.scrollHeight;
      isPrepending.current = true;

      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;

      loadMessages(nextPage, true).then(() => {
        requestAnimationFrame(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop += newHeight - prevHeight;
          isPrepending.current = false;
        });
      });
    }
  }, [loadMessages]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.addEventListener("scroll", handleScroll);
    return () => c.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isPrepending.current) return;
    if (messages.length > prevMsgCount.current && shouldAutoScroll.current) {
      scrollToBottom("smooth");
    }
    prevMsgCount.current = messages.length;
  }, [messages, scrollToBottom]);

  /* Handle Incoming Socket Messages */
  const handleSocketMessage = useCallback(
    (incoming) => {
      if (!incoming || incoming.chatId !== chatId) return;

      // Delete
      if (incoming.isDelete) {
        setMessages((prev) => prev.filter((m) => m._id !== incoming._id));
        return;
      }

      // Edit
      if (incoming.isEdit) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === incoming._id ? { ...m, ...incoming, isEdited: true } : m
          )
        );
        return;
      }

      // New Message
      setMessages((prev) =>
        prev.some((m) => m._id === incoming._id) ? prev : [...prev, incoming]
      );

      // Auto mark as read if message is from friend and chat is open
      if (incoming.sender?._id === chat?.friend?._id) {
        messageService
          .readMessages({ chatId, receiverId: chat.friend._id })
          .catch(() => {});
      }
    },
    [chatId, chat?.friend?._id]
  );

  /* Handle Read Receipts – Only Update Specific Messages */
  const handleReadUpdate = useCallback(
    (data) => {
      // expected payload: { chatId, reader, messageIds: [ ...ids ] }
      // console for debugging:
      console.log("🔵 Read event received:", data);

      if (!data) return;
      const { chatId: cId, messageIds = [], reader } = data;
      if (
        cId !== chatId ||
        !Array.isArray(messageIds) ||
        messageIds.length === 0
      )
        return;

      const friendId = String(chat?.friend?._id ?? chat?.friend ?? "");
      const myId = String(currentUser?._id ?? "");

      setMessages((prev) =>
        prev.map((m) => {
          const senderId = String(
            typeof m.sender === "object" ? m.sender?._id : m.sender ?? ""
          );
          // Only mark messages *I sent* as read if the friend (reader) is the one who read
          const isMine = senderId === myId;
          const isReadByFriend =
            String(reader) === friendId && messageIds.includes(String(m._id));

          if (isMine && isReadByFriend && !m.isRead) {
            return { ...m, isRead: true };
          }
          return m;
        })
      );
    },
    [chatId, chat?.friend, currentUser?._id]
  );

  useChatSocket(chatId, handleSocketMessage, token, handleReadUpdate);

  /* Send Message */
  const onSend = useCallback(
    async ({ text, file }) => {
      const content = text?.trim();
      if (!content && !file) return;

      try {
        const fd = new FormData();
        fd.append("chatId", chatId);

        let messageType = "text";
        if (file) {
          const mime = file.type;
          if (mime.startsWith("image/")) messageType = "image";
          else if (mime.startsWith("video/")) messageType = "video";
          else if (mime.startsWith("audio/")) messageType = "audio";
          else messageType = "file";
        }

        if (content) fd.append("text", content);
        if (file) fd.append("file", file);
        fd.append("messageType", messageType);

        await messageService.sendMessage(fd);
        shouldAutoScroll.current = true;
        scrollToBottom("smooth");
      } catch (err) {
        console.error("Send message failed:", err);
      }
    },
    [chatId, scrollToBottom]
  );

  if (!chatId || !chat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ChatHeader chat={chat} />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2"
      >
        {loading && messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-2">Loading...</p>
        )}

        {messages.map((m) => (
          <Message
            key={m._id}
            message={m}
            currentUserId={currentUser?._id}
            chatType={chat?.isGroup ? "group" : "private"}
            onDelete={handleDeleteMessage} // ✅ added
            onEdit={handleEditMessage} // ✅ added
          />
        ))}

        <div ref={endRef} />
      </div>

      <ChatInput
        onSend={onSend}
        disabled={chat?.inactiveFor?.includes(currentUser?._id)}
      />
    </div>
  );
});

ChatTab.displayName = "ChatTab";

export default ChatTab;
