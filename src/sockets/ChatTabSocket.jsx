// sockets/ChatTabSocket.jsx
import { useEffect, useRef } from "react";
import { getSocket, connectSocket } from "../socket.js";
import { ChatEventEnum } from "../constant.js";
import toast from "react-hot-toast";

const useChatSocket = (chatId, onMessage, token, onReadUpdate) => {
  const socketRef = useRef(null);
  const joinedRef = useRef(false);

useEffect(() => {
  if (!token) return;
  let s = getSocket();
  if (!s) s = connectSocket(token);
  socketRef.current = s;
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
    const handleRead = (data) =>
      data?.chatId === chatId && onReadUpdate?.(data);
    const handleOther = ({ chatId: inc }) =>
      inc !== chatId &&
      toast(<div>New message in another chat</div>, { duration: 3000 });

    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleMsg);
    socket.on(ChatEventEnum.MESSAGE_EDIT_EVENT, handleEdit);
    socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, handleDelete);
    socket.on(ChatEventEnum.MESSAGE_READ_EVENT, handleRead);
    socket.on(ChatEventEnum.UNREAD_COUNT_UPDATE, handleOther);

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
      socket.off(ChatEventEnum.UNREAD_COUNT_UPDATE, handleOther);
    };
  }, [chatId, onMessage, onReadUpdate, token]);

  // DO NOT RETURN ANYTHING
  return null;
};

export default useChatSocket;
