import { useEffect } from "react";
import { getSocket, connectSocket } from "../socket.js";
import { ChatEventEnum } from "../constant.js";

const useFriendRequestSocket = (onUpdate, token) => {
  useEffect(() => {
    if (!token) return;

    let socket = getSocket();
    if (!socket) socket = connectSocket(token);
    console.log("connecting", socket)
    if (!socket) return;

    console.log("[Socket Hook] Listening for friend request events...");

    const handleNewRequest = (data) => {
      console.log("📩 [Socket] New friend request received:", data);
      onUpdate?.({ type: "NEW_REQUEST", payload: data });
    };

    const handleStatusUpdate = (data) => {
      console.log("📩 [Socket] Friend request status updated:", data);
      onUpdate?.({ type: "STATUS_UPDATE", payload: data });
    };

    // Debug: show all events coming in
    socket.onAny((event, data) => console.log("📡 Event:", event, data));

    socket.on(ChatEventEnum.NEW_REQUEST, handleNewRequest);
    socket.on(ChatEventEnum.STATUS_UPDATE, handleStatusUpdate);

    return () => {
      socket.off(ChatEventEnum.NEW_REQUEST, handleNewRequest);
      socket.off(ChatEventEnum.STATUS_UPDATE, handleStatusUpdate);
    };
  }, [token, onUpdate]);
};

export default useFriendRequestSocket;
