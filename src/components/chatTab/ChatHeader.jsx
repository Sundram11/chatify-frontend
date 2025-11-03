import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import friendService from "../../backendServices/friends.js";
import messageService from "../../backendServices/messages.js";
import { Button } from "../index.js";
import { MoreVertical, X } from "lucide-react";

const ChatHeader = ({ chat }) => {
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
      navigate("/"); // go back after unfollow
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
      navigate("/"); // return to home
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
      <header className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold uppercase">
            {friend?.fullName?.[0] || chat?.name?.[0]}
          </div>
          <p className="font-semibold text-lg">
            {chat?.isGroup ? chat.name : friend?.fullName}
          </p>
        </div>

        <button
          onClick={() => setShowOptions(true)}
          className="p-2 rounded-full hover:bg-teal-700 transition"
        >
          <MoreVertical size={22} />
        </button>
      </header>

      {showOptions && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-2xl shadow-lg p-6 w-80">
            <button
              onClick={() => setShowOptions(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>

            <div className="text-center mt-2 mb-4">
              <h2 className="text-xl font-bold mb-1">
                {friend?.fullName || chat?.name}
              </h2>
              <p className="text-gray-600 text-sm">
                {friend?.email || "No email available"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {!chat?.isGroup && (
                <Button
                  onClick={handleUnfollow}
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {loading ? "Processing..." : "Unfollow"}
                </Button>
              )}

              <Button
                onClick={handleDeleteChat}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
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
