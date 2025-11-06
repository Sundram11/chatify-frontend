import React from "react";
import friendService from "../../backendServices/friends.js";
import { getSocket } from "../../socket";
import { ChatEventEnum } from "../../constant";

const UserCard = ({
  user,
  isIncomingRequest = false,
  onAccept,
  onReject,
  onOpenChat,
}) => {
  const { _id, fullName, email, profilePic, friendRequestStatus } = user;

  // 🟩 Send friend request
  const onFollow = async (userId) => {
    try {
      const res = await friendService.sendFriendRequest(userId);
      console.log("Request sent:", res);

      const socket = getSocket();
      if (socket) {
        socket.emit(ChatEventEnum.NEW_REQUEST, {
          receiverId: userId,
          status: "pending",
        });
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  // 🟨 Render action buttons
  const renderActions = () => {
    if (isIncomingRequest && friendRequestStatus === "pending") {
      return (
        <>
          <button
            onClick={onAccept}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reject
          </button>
        </>
      );
    }

    switch (friendRequestStatus) {
      case "pending":
        return (
          <button
            disabled
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg cursor-not-allowed"
          >
            Pending
          </button>
        );

      case "rejected":
        return (
          <button
            onClick={() => onFollow(_id)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Follow
          </button>
        );

      case "accepted":
        return (
          <>
            <button
              disabled
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg"
            >
              Friends
            </button>
            {onOpenChat && (
              <button
                onClick={() => onOpenChat(user)}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Message
              </button>
            )}
          </>
        );

      default:
        return (
          <button
            onClick={() => onFollow(_id)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Follow
          </button>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-750 transition">
      <div className="flex items-center gap-3">
        <img
          src={profilePic || "/default-avatar.png"}
          alt={fullName}
          className="w-10 h-10 rounded-full object-cover border border-gray-700"
        />
        <div>
          <p className="text-white font-medium">{fullName}</p>
          <p className="text-gray-400 text-sm">{email}</p>
        </div>
      </div>
      <div className="flex gap-2">{renderActions()}</div>
    </div>
  );
};

export default UserCard;
