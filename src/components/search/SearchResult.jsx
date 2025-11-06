import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "../../backendServices/auth.js";
import chatService from "../../backendServices/chat.js";
import { UserCard } from "../index.js";
import ChatTab from "../chatTab/ChatTab.jsx";
import useFriendRequestSocket from "../../sockets/FriendRequestSocket.js";

const SearchResultsPage = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [localMessageEvent, setLocalMessageEvent] = useState(null);

  const location = useLocation();
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  const fetchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await authService.searchUsers(searchTerm);
      setUsers(res?.data?.users || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) fetchUsers(query);
  }, [query]);

  useFriendRequestSocket(
    (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === data.senderId || u._id === data.receiverId
            ? { ...u, friendRequestStatus: data.status }
            : u
        )
      );
    },
    accessToken
  );

  const handleOpenChat = useCallback(async (userObj) => {
    try {
      const chatRes = await chatService.createOrGetOneToOneChat(userObj._id);
      const chatData = {
        ...chatRes.data,
        friend: {
          _id: userObj._id,
          fullName: userObj.fullName,
          email: userObj.email,
          profilePic: userObj.profilePic,
        },
      };
      setSelectedChat(chatData);
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  }, []);

  const handleMessageSent = useCallback((event) => {
    setLocalMessageEvent(event);
  }, []);

  if (selectedChat) {
    return (
      <div className="h-screen flex flex-col">
        <ChatTab
          chat={selectedChat}
          onMessageSent={handleMessageSent}
          onBack={() => setSelectedChat(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Search Results for{" "}
        "<span className="text-teal-600 dark:text-teal-400">{query}</span>"
      </h1>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 animate-pulse">
          Searching...
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user) => (
            <UserCard key={user._id} user={user} onOpenChat={handleOpenChat} />
          ))}
        </div>
      ) : query.trim() ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
          No users found for "<span className="font-medium">{query}</span>"
        </p>
      ) : (
        <p className="text-gray-400 dark:text-gray-500 text-center py-6">
          Start typing in the search bar to find users
        </p>
      )}
    </div>
  );
};

export default SearchResultsPage;
