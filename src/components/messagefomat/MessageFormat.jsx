import React, { memo, useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { CheckCheck } from "lucide-react";

const Message = ({ message, currentUserId, chatType, onDelete, onEdit }) => {
  const isSentByMe = message.sender?._id === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((p) => !p);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(message._id);
  };

  const startEdit = () => {
    setMenuOpen(false);
    setIsEditing(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit?.(message._id, editText);
    setIsEditing(false);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className={`group flex relative px-2 my-1 ${
        isSentByMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-xs sm:max-w-sm md:max-w-md p-2 rounded-xl backdrop-blur-sm
          ${
            isSentByMe
              ? "bg-emerald-700/80 text-white" // ✅ subtle opacity for my messages
              : "bg-gray-800/80 text-gray-200" // ✅ same translucent tone
          }
        `}
      >
        {/* 👥 Sender name for group chats */}
        {chatType === "group" && !isSentByMe && (
          <p className="text-xs text-gray-400 mb-1">
            {message.sender?.fullName || "Unknown"}
          </p>
        )}

        {/* ✏️ Editing mode */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-white text-black px-2 py-1 rounded w-full"
              autoFocus
            />
            <button
              type="submit"
              className="text-xs bg-blue-700 px-2 py-1 rounded text-white"
            >
              Save
            </button>
          </form>
        ) : (
          <>
            {/* 🖼️ File / Image */}
            {message.fileUrl && (
              <div className="mb-1">
                {message.messageType === "image" ? (
                  <img
                    src={message.fileUrl}
                    alt="attachment"
                    className="rounded-md max-w-full"
                  />
                ) : (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-sm break-all"
                  >
                    📎 {message.text || "Download File"}
                  </a>
                )}
              </div>
            )}

            {/* 💬 Text */}
            {message.text && (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            )}
          </>
        )}

        {/* 🪶 Edited label */}
        {message.isEdited && !isEditing && (
          <span className="text-xs text-gray-300 ml-1">(edited)</span>
        )}

        {/* 🕒 Timestamp + Read status */}
        {message.createdAt && (
          <div className="flex items-center justify-end mt-1 gap-1 text-[10px] text-gray-300">
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {isSentByMe && (
              <span className="flex items-center ml-1">
                <CheckCheck
                  size={20}
                  strokeWidth={2}
                  className={`transition-colors duration-300 ${
                    message.isRead
                      ? "text-sky-400" // ✅ Deep blue for read
                      : "text-gray-400 opacity-70" // ✅ Faint gray hollow look
                  }`}
                />
              </span>
            )}
          </div>
        )}

        {/* ⋮ Message menu */}
        {isSentByMe && (
          <div ref={menuRef} className="absolute top-1 right-1">
            <button
              onClick={toggleMenu}
              className="p-1 rounded-full hover:bg-blue-700/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <HiChevronDown size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 bg-gray-900 text-white text-sm rounded-lg shadow-xl w-28 z-10">
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-700"
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-600"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Message);
