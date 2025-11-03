import { io } from "socket.io-client";
import { ChatEventEnum } from "./constant.js";

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("[SOCKET] Connected ✅", socket.id));
  socket.on("disconnect", (r) => console.warn("[SOCKET] Disconnected ⚠️", r));
  socket.on("connect_error", (e) => console.error("[SOCKET] Connect error ❌", e.message));
  socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, (e) =>
    console.error("[SOCKET] Server error ⚠️", e)
  );

  return socket;
};

export const getSocket = () => socket;
