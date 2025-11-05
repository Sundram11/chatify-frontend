import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import authService from "../../backendServices/auth.js";
import { UserCard, Input } from "../index.js";
import useFriendRequestSocket from "../../sockets/FriendRequestSocket.js";

const SearchResults = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);

  // 🟦 Read initial query from URL
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  // 🟢 Fetch users from backend
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

  // 🔵 Fetch when query changes
  useEffect(() => {
    if (query) fetchUsers(query);
  }, [query]);

  // 🟣 Real-time friend request updates
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

  // 🟠 Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    fetchUsers(query);
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 transition-all duration-300">
      {/* 🔍 Search Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center mb-6 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-teal-500 transition-all"
      >
        <Search className="text-gray-500 dark:text-gray-400 w-5 h-5 mr-2" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="bg-transparent flex-1 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-none focus:outline-none"
        />
      </form>

      {/* 🧩 Results */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 animate-pulse">
          Searching...
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-3 animate-fadeIn">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      ) : query.trim() ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
          No users found for "<span className="font-medium">{query}</span>"
        </p>
      ) : (
        <p className="text-gray-400 dark:text-gray-500 text-center py-6">
          Type something to start searching 🔍
        </p>
      )}
    </div>
  );
};

export default SearchResults;
