import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import friendService from "../../backendServices/friends.js";
import messageService from "../../backendServices/messages.js";
import { Button } from "../index.js";
import { MoreVertical, X, ArrowLeft } from "lucide-react";

const ChatHeader = ({ chat, onBack }) => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const friend = chat?.friend;

  // ✅ Unfollow Friend
  const handleUnfollow = useCallback(async () => {
    if (!friend?._id) return;
    if (!window.confirm(`Unfollow ${friend.fullName}?`)) return;
    try {
      setLoading(true);
      await friendService.unfollowFriend(friend._id);
      alert(`${friend.fullName} unfollowed successfully`);
      setShowOptions(false);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Error unfollowing friend");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [friend, navigate]);

  // ✅ Delete Chat
  const handleDeleteChat = useCallback(async () => {
    if (!chat?._id) return;
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      setLoading(true);
      await messageService.deleteChat(chat._id);
      alert("Chat deleted successfully");
      setShowOptions(false);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete chat");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [chat, navigate]);

  if (!chat) return null;

  return (
    <>
      {/* 🌐 Header */}
      <header
        className="
          flex items-center justify-between
          px-4 sm:px-6 py-3
          bg-teal-600 dark:bg-teal-700 text-white
          shadow-md dark:shadow-none
          sticky top-0 z-30
        "
      >
        {/* Left section: Back + avatar + name */}
        <div className="flex items-center gap-3 min-w-0">
          {/* 📱 Mobile back arrow */}
          {onBack && (
            <button
              onClick={onBack}
              className="
                md:hidden p-1.5 rounded-full
                hover:bg-teal-700 dark:hover:bg-teal-800
                transition
              "
            >
              <ArrowLeft size={22} />
            </button>
          )}

          {/* 🖼 Avatar */}
          {chat.isGroup ? (
            <div className="
              w-10 h-10 rounded-full 
              flex items-center justify-center font-semibold
              bg-blue-600 dark:bg-blue-500 text-white
              shadow-inner
            ">
              {chat.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img
              src={chat.friend?.profilePic || "/profileImage.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
          )}

          {/* Name */}
          <p className="
            font-semibold text-base sm:text-lg truncate
            max-w-[130px] sm:max-w-[200px]
          ">
            {chat?.isGroup ? chat.name : friend?.fullName}
          </p>
        </div>

        {/* ⚙️ Options button */}
        <button
          onClick={() => setShowOptions(true)}
          className="
            p-2 rounded-full hover:bg-teal-700 dark:hover:bg-teal-800
            transition-colors
          "
        >
          <MoreVertical size={22} />
        </button>
      </header>

      {/* ⚡ Options Modal */}
      {showOptions && (
        <div
          className="
            fixed inset-0 bg-black/40 dark:bg-black/60 
            flex justify-center items-center z-50
            px-4
          "
        >
          <div
            className="
              relative w-full max-w-sm bg-white dark:bg-gray-800
              rounded-2xl shadow-lg dark:shadow-xl
              p-6 sm:p-7
            "
          >
            <button
              onClick={() => setShowOptions(false)}
              className="
                absolute top-3 right-3 text-gray-500 dark:text-gray-400 
                hover:text-black dark:hover:text-white transition
              "
            >
              <X size={20} />
            </button>

            {/* User Info */}
            <div className="text-center mt-1 mb-5">
              <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                {friend?.fullName || chat?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {friend?.email || "No email available"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!chat?.isGroup && (
                <Button
                  onClick={handleUnfollow}
                  disabled={loading}
                  className="
                    bg-yellow-500 hover:bg-yellow-600 
                    dark:bg-yellow-600 dark:hover:bg-yellow-500 
                    text-white
                  "
                >
                  {loading ? "Processing..." : "Unfollow"}
                </Button>
              )}

              <Button
                onClick={handleDeleteChat}
                disabled={loading}
                className="
                  bg-red-600 hover:bg-red-700 
                  dark:bg-red-700 dark:hover:bg-red-600 
                  text-white
                "
              >
                {loading ? "Processing..." : "Delete Chat"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
