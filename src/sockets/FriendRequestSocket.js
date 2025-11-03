import { useEffect } from "react";
import { getSocket } from "../socket.js";
import { ChatEventEnum } from "../constant.js";

const useFriendRequestSocket = (onUpdate, token) => {
  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket) return;

    // 🟢 When a new friend request is sent to this user
    const handleNewRequest = (data) => {
      console.log("[Socket] New friend request received:", data);
      onUpdate?.(data);
    };

    // 🟢 When the status (pending → accepted/rejected) changes
    const handleStatusUpdate = (data) => {
      console.log("[Socket] Friend request status updated:", data);
      onUpdate?.(data);
    };

    socket.on(ChatEventEnum.NEW_REQUEST, handleNewRequest);
    socket.on(ChatEventEnum.STATUS_UPDATE, handleStatusUpdate);

    return () => {
      socket.off(ChatEventEnum.NEW_REQUEST, handleNewRequest);
      socket.off(ChatEventEnum.STATUS_UPDATE, handleStatusUpdate);
    };
  }, [token, onUpdate]);
};

export default useFriendRequestSocket;
