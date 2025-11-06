import React from "react";
import { Bs1CircleFill } from "react-icons/bs";

const ChatParticipant = ({
  chat,
  unread,
  selected,
  onSelectChat,
  formatTime,
}) => {
  // 🟢 hide unread if group
  const showUnread = unread && !chat.isGroup;

  return (
    <li
      onClick={() => onSelectChat(chat)}
      className={`flex items-center p-2 rounded-xl cursor-pointer transition relative select-none
        ${
          selected
            ? "bg-gray-200 dark:bg-gray-800"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        ${showUnread ? "ring-1 ring-blue-500/40" : ""}`}
    >
      {/* avatar */}
      {chat.isGroup ? (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {chat.name?.[0]?.toUpperCase()}
        </div>
      ) : (
        <img
          src={chat.friend?.profilePic || "/profileImage.png"}
          alt=""
          className="w-10 h-10 rounded-full object-cover border border-gray-700"
        />
      )}

      {/* details */}
      <div className="ml-3 flex-1 min-w-0">
        <p
          className={`font-medium truncate ${
            showUnread
              ? "text-gray-800 dark:text-white"
              : "text-gray-800 dark:text-gray-400"
          }`}
        >
          {chat.name || chat.friend?.fullName}
        </p>
      </div>

      {/* time + unread dot */}
      <div className="flex flex-col items-end ml-2 space-y-1">
        <span
          className={`text-xs ${
            showUnread ? "text-blue-400" : "text-gray-500"
          }`}
        >
          {formatTime(chat.lastMessageTime)}
        </span>

        {/* 🟢 only show for one-to-one chats */}
        {showUnread && <Bs1CircleFill size={16} className="text-blue-400" />}
      </div>
    </li>
  );
};

export default ChatParticipant;
