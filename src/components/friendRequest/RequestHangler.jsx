import React, { useEffect, useState, useCallback } from "react";
import friendService from "../../backendServices/friends.js";
import UserCard from "../userCard/UserCard";
import useFriendRequestSocket from "../../sockets/FriendRequestSocket.js";
import { useSelector } from "react-redux";

const FriendRequests = ({ onOpenChat }) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNewRequests, setHasNewRequests] = useState(false);

  const { token } = useSelector((state) => state.auth);

  // 🔹 Fetch functions
  const fetchIncoming = async () => {
    setLoading(true);
    try {
      const res = await friendService.getPendingRequest();
      setIncoming(res.data || []);
      setHasNewRequests(res.data?.length > 0);
    } catch (err) {
      console.error("Error fetching incoming:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await friendService.getAllActiveFriends();
      setFriends(res.data || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Accept / Reject
  const acceptRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
      if (incoming.length <= 1) setHasNewRequests(false); // remove badge if no more requests
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
      if (incoming.length <= 1) setHasNewRequests(false); // remove badge if no more requests
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  // 🔹 Socket Updates
  const handleSocketUpdate = useCallback(
    (event) => {
      const { type, payload } = event;

      if (type === "NEW_REQUEST") {
        setIncoming((prev) => [payload, ...prev]);
        setHasNewRequests(true);
      }

      if (type === "STATUS_UPDATE") {
        // Update sent requests
        setSent((prev) =>
          prev.map((req) =>
            req.requestId === payload.requestId
              ? { ...req, friendRequestStatus: payload.status }
              : req
          )
        );

        // Add to friends if accepted
        if (payload.status === "accepted") {
          setFriends((prev) => [...prev, payload]);
        }

        // Remove from incoming if rejected or accepted
        setIncoming((prev) =>
          prev.filter((r) => r.requestId !== payload.requestId)
        );

        // Remove notification if incoming list is empty
        if (incoming.length <= 1) setHasNewRequests(false);
      }
    },
    [incoming]
  );

  useFriendRequestSocket(handleSocketUpdate, token);

  // 🔹 Auto-fetch based on tab
  useEffect(() => {
    if (activeTab === "sent") fetchSent();
    else {
      fetchIncoming();
      fetchFriends();
    }
  }, [activeTab]);

  const renderRequests = (list, isIncoming = false) => {
    if (loading)
      return (
        <div className="text-center text-gray-400 py-10 animate-pulse">
          Loading...
        </div>
      );

    if (!list.length)
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
          No{" "}
          {isIncoming ? "incoming" : activeTab === "sent" ? "sent" : "friends"}{" "}
          found.
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
            onOpenChat={onOpenChat}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 sm:p-6 md:p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 shadow-md">
      {/* 🔹 Header Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex w-full sm:w-auto justify-around sm:justify-center gap-4 border-b border-gray-300 dark:border-gray-700">
          {["friends", "sent", "incoming"].map((tab) => {
            const isActive = activeTab === tab;
            const showBadge = tab === "incoming" && hasNewRequests;

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "incoming") setHasNewRequests(false);
                }}
                className={`
                  relative px-4 py-2 text-sm sm:text-base font-semibold transition-colors duration-200
                  ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}

                {/* 🔔 Notification Badge */}
                {showBadge && (
                  <span className="absolute top-0 right-[-8px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow">
                    🔔
                  </span>
                )}

                {isActive && (
                  <span className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔹 Requests Section */}
      <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
        {activeTab === "friends"
          ? renderRequests(friends)
          : activeTab === "sent"
          ? renderRequests(sent)
          : renderRequests(incoming, true)}
      </div>
    </div>
  );
};

export default FriendRequests;
