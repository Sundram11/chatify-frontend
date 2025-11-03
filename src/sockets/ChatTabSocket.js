import { useEffect, useRef } from "react";
import { getSocket, connectSocket } from "../socket.js";
import { ChatEventEnum } from "../constant.js";

const useChatSocket = (chatId, onMessage, token, onReadUpdate) => {
  const socketRef = useRef(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    let socket = getSocket();
    if (!socket) socket = connectSocket(token);
    socketRef.current = socket;
  }, [token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !chatId) return;

    const handleMsg = (msg) => msg?.chatId === chatId && onMessage(msg);
    const handleEdit = (msg) =>
      msg?.chatId === chatId && onMessage({ ...msg, isEdit: true });
    const handleDelete = (data) =>
      data?.chatId === chatId &&
      onMessage({ _id: data._id, chatId: data.chatId, isDelete: true });

    const handleRead = (data) => {
      if (data?.chatId === chatId) onReadUpdate?.(data);
    };

    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleMsg);
    socket.on(ChatEventEnum.MESSAGE_EDIT_EVENT, handleEdit);
    socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, handleDelete);
    socket.on(ChatEventEnum.MESSAGE_READ_EVENT, handleRead);

    const join = () => {
      if (joinedRef.current) return;
      socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, chatId);
      joinedRef.current = true;
    };

    if (socket.connected) join();
    else socket.once("connect", join);

    const onReconnect = () => {
      joinedRef.current = false;
      join();
    };
    socket.on("reconnect", onReconnect);

    return () => {
      if (joinedRef.current)
        socket.emit(ChatEventEnum.LEAVE_CHAT_EVENT, chatId);
      joinedRef.current = false;
      socket.off("reconnect", onReconnect);
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleMsg);
      socket.off(ChatEventEnum.MESSAGE_EDIT_EVENT, handleEdit);
      socket.off(ChatEventEnum.MESSAGE_DELETE_EVENT, handleDelete);
      socket.off(ChatEventEnum.MESSAGE_READ_EVENT, handleRead);
    };
  }, [chatId, onMessage, onReadUpdate]);

  return null;
};

export default useChatSocket;
