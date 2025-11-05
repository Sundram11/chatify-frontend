import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
} from "react";
import { useSelector, shallowEqual } from "react-redux";
import { ChevronDown } from "lucide-react";
import Message from "../messagefomat/MessageFormat.jsx";
import messageService from "../../backendServices/messages.js";
import useChatSocket from "../../sockets/ChatTabSocket.jsx";
import ChatHeader from "./ChatHeader.jsx";
import ChatInput from "./ChatInput.jsx";

const PAGE_SIZE = 15;

const ChatTab = memo(({ chat, onMessageSent, onBack }) => {
  const chatId = chat?._id;
  const { accessToken: token, user: currentUser } = useSelector(
    (s) => ({ accessToken: s.auth.accessToken, user: s.auth.user }),
    shallowEqual
  );

  // ────────────────────────────────────── state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  // ────────────────────────────────────── helpers
  const markAsRead = useCallback(async ({ chatId, receiverId }) => {
    try {
      await messageService.readMessages({ chatId, receiverId });
    } catch (err) {
      console.error("markAsRead failed", err);
    }
  }, []);

  // ────────────────────────────────────── load messages
  const loadMessages = useCallback(
    async (p = 1, prepend = false) => {
      if (!chatId || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const { data } = await messageService.getMessages(chatId, p, PAGE_SIZE);
        const newMsgs = data?.messages || [];

        setMessages((prev) => {
          const merged = prepend ? [...newMsgs, ...prev] : [...prev, ...newMsgs];
          setHasMore(data?.pagination?.hasMore ?? false);
          return merged;
        });

        const friendId = chat?.friend?._id ?? chat?.friend;
        if (friendId) markAsRead({ chatId, receiverId: friendId });
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [chatId, chat?.friend, markAsRead]
  );

  // ────────────────────────────────────── init on chat change
useEffect(() => {
  if (!chatId) return;
  const init = async () => {
    setMessages([]);
    setHasMore(true);
    pageRef.current = 1;
    await loadMessages(1);
  };
  init();
}, [chatId, loadMessages]);


  // ────────────────────────────────────── delete / edit
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("Delete message failed:", err);
    }
  }, []);

  const handleEditMessage = useCallback(async (messageId, newText) => {
    try {
      const { data } = await messageService.editMessage(messageId, newText);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, ...data, isEdited: true } : m
        )
      );
    } catch (err) {
      console.error("Edit message failed:", err);
    }
  }, []);

  // ────────────────────────────────────── scroll logic
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
  setShowScrollButton(!isNearBottom);

  if (isNearTop && hasMoreRef.current) {
    const prevHeight = container.scrollHeight;
    isPrepending.current = true;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;

    const loadMore = async () => {
      await loadMessages(nextPage, true);
      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop += newHeight - prevHeight;
        isPrepending.current = false;
      });
    };
    loadMore();
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

  // ────────────────────────────────────── socket handlers
  const handleSocketMessage = useCallback(
    (incoming) => {
      if (!incoming || incoming.chatId !== chatId) return;

      if (incoming.isDelete) {
        setMessages((prev) => prev.filter((m) => m._id !== incoming._id));
        return;
      }
      if (incoming.isEdit) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === incoming._id ? { ...m, ...incoming, isEdited: true } : m
          )
        );
        return;
      }

      setMessages((prev) =>
        prev.some((m) => m._id === incoming._id) ? prev : [...prev, incoming]
      );

      if (incoming.sender?._id === chat?.friend?._id) {
        messageService
          .readMessages({ chatId, receiverId: chat.friend._id })
          .catch(() => {});
      }
    },
    [chatId, chat?.friend?._id]
  );

  const handleReadUpdate = useCallback(
    (data) => {
      if (!data) return;
      const { chatId: cId, messageIds = [], reader } = data;
      if (cId !== chatId || !messageIds.length) return;

      const friendId = String(chat?.friend?._id ?? chat?.friend ?? "");
      const myId = String(currentUser?._id ?? "");

      setMessages((prev) =>
        prev.map((m) => {
          const senderId = String(
            typeof m.sender === "object" ? m.sender?._id : m.sender ?? ""
          );
          const isMine = senderId === myId;
          const isReadByFriend =
            String(reader) === friendId && messageIds.includes(String(m._id));

          return isMine && isReadByFriend && !m.isRead
            ? { ...m, isRead: true }
            : m;
        })
      );
    },
    [chatId, chat?.friend, currentUser?._id]
  );

  // **THIS IS THE ONLY LINE THAT CALLS THE SOCKET HOOK**
  useChatSocket(chatId, handleSocketMessage, token, handleReadUpdate);

  // ────────────────────────────────────── send message
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
        onMessageSent?.({ chatId, createdAt: new Date().toISOString() });
      } catch (err) {
        console.error("Send message failed:", err);
      }
    },
    [chatId, scrollToBottom, onMessageSent]
  );

  // ────────────────────────────────────── render
  if (!chatId || !chat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-teal-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-all duration-300">
      <ChatHeader chat={chat} onBack={onBack} />

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2"
      >
        {loading && messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-2">Loading...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 italic">
            No messages yet — start the conversation
          </p>
        )}
       {messages.map((m) => (
  <Message
    key={m._id}
    message={m}
    currentUserId={currentUser?._id}
    chatType={chat?.isGroup ? "group" : "private"}
    onDelete={handleDeleteMessage} // stable
    onEdit={handleEditMessage} // stable
  />
))}

        <div ref={endRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-24 right-4 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full shadow-lg transition"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
      )}

      {/* Input */}
      <ChatInput
        onSend={onSend}
        disabled={chat?.inactiveFor?.includes(currentUser?._id)}
      />
    </div>
  );
});

ChatTab.displayName = "ChatTab";
export default ChatTab;