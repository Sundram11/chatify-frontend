import React, { useEffect, useState } from "react";
import friendService from "../../backendServices/friends";
import UserCard from "../userCard/UserCard";

const FriendRequests = () => {
  const [activeTab, setActiveTab] = useState("incoming"); // incoming | sent | friends
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch incoming requests
  const fetchIncoming = async () => {
    setLoading(true);
    try {
      const res = await friendService.getPendingRequest();
      setIncoming(res.data || []);
    } catch (err) {
      console.error("Error fetching incoming:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch sent requests
  const fetchSent = async () => {
    setLoading(true);
    try {
      const res = await friendService.getSentRequests();
      setSent(res.data || []);
    } catch (err) {
      console.error("Error fetching sent:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch all active friends
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await friendService.getAllActiveFriends();
      setFriends(res.data || []);
      console.log("Active friends:", res.data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Accept
  const acceptRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  // 🔹 Reject
  const rejectRequest = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  // 🔹 Load based on tab
  useEffect(() => {
    if (activeTab === "incoming") fetchIncoming();
    else if (activeTab === "sent") fetchSent();
    else fetchFriends();
  }, [activeTab]);

  // 🔹 Render list
  const renderRequests = (list, isIncoming = false) => {
    if (loading)
      return (
        <div className="text-center text-gray-400 py-10">
          Loading...
        </div>
      );

    if (!list.length)
      return (
        <p className="text-gray-400 text-center py-4">
          No {isIncoming ? "incoming" : "sent"} requests.
        </p>
      );

    return (
      <div className="space-y-3">
        {list.map((req) => (
          <UserCard
            key={req.requestId || req._id}
            user={req}
            isIncomingRequest={isIncoming}
            onAccept={() => acceptRequest(req.requestId)}
            onReject={() => rejectRequest(req.requestId)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4">
      {/* Tabs */}
      <div className="flex justify-center mb-6 border-b border-gray-700">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "incoming"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("incoming")}
        >
          Incoming
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "sent"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "friends"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("friends")}
        >
          All Friends
        </button>
      </div>

      {/* Content */}
      {activeTab === "incoming"
        ? renderRequests(incoming, true)
        : activeTab === "sent"
        ? renderRequests(sent, false)
        : renderRequests(friends, false)}
    </div>
  );
};

export default FriendRequests;
