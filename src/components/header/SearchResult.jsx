import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import authService from "../../backendServices/auth.js";
import { UserCard } from "../index.js";
import useFriendRequestSocket from "../../sockets/FriendRequestSocket.js";

const SearchResults = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // ✅ Correct Redux selector
  const { accessToken } = useSelector((state) => state.auth);

  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query) return;
      try {
        const res = await authService.searchUsers(query);
        setUsers(res?.data?.users || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [query]);

  // ✅ Real-time friend request updates
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

  if (loading)
    return (
      <div className="text-center text-gray-400 py-10">Searching...</div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4">
      <h2 className="text-white text-xl font-semibold mb-4">
        Search Results for: <span className="text-blue-400">{query}</span>
      </h2>

      {users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-4">No users found.</p>
      )}
    </div>
  );
};

export default SearchResults;
