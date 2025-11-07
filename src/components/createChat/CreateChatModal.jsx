import React, { useState, useEffect } from "react";
import chatService from "../../backendServices/chat";
import friendService from "../../backendServices/friends";
import { X } from "lucide-react";

const CreateChatModal = ({ open, onClose, onChatCreated }) => {
  const [friends, setFriends] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");

  // 🟢 Fetch friends when modal opens
  useEffect(() => {
    if (open) {
      friendService.getAllActiveFriends().then((res) => {
        setFriends(res.data || []);
      });
    }
  }, [open]);

  // 🟣 Auto reset everything when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setGroupName("");
      setIsGroup(false);
    }
  }, [open]);

  const handleSelect = (id) => {
    // Toggle for both radio and checkbox logic
    if (isGroup) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]); // Only one for private chat
    }
  };

  const handleCreate = async () => {
    try {
      if (isGroup) {
        if (!groupName.trim()) return alert("Please enter group name!");
        if (selectedIds.length < 2)
          return alert("Select at least 2 members for a group!");

        await chatService.createGroupChat({
          name: groupName,
          participantIds: selectedIds,
        });
      } else {
        if (selectedIds.length === 0)
          return alert("Select at least one user!");
        await chatService.createOrGetOneToOneChat(selectedIds[0]);
      }

      // ✅ Trigger sidebar refresh
      onChatCreated?.();

      // Reset + close
      handleClose();
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setGroupName("");
    setIsGroup(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-5 w-96">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isGroup ? "Create Group" : "Create Chat"}
          </h2>
          <button onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Friends List */}
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {friends.map((f) => (
            <label
              key={f._id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
            >
              <input
                type={isGroup ? "checkbox" : "radio"}
                checked={selectedIds.includes(f._id)}
                onChange={() => handleSelect(f._id)}
              />
              <img
                src={f.profilePic || "/profilePic.png"}
                className="w-8 h-8 rounded-full"
                alt="profile"
              />
              <span>{f.fullName}</span>
            </label>
          ))}
        </div>

        {/* Group Name Input */}
        {isGroup && (
          <input
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border p-2 rounded mb-3 dark:bg-gray-800 dark:text-white"
          />
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setIsGroup((p) => !p)}
            className="text-sm text-blue-600"
          >
            {isGroup ? "Switch to Private Chat" : "Switch to Group Chat"}
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal;
