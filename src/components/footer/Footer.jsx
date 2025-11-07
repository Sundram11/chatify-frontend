import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { FaUserFriends } from "react-icons/fa";
import { ThemeToggle } from "../index.js";
import { useDispatch, useSelector } from "react-redux";
import { authLogout } from "../../store/AuthSlice.js";
import useFriendRequestSocket from "../../sockets/FriendRequestSocket.js";

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [hasNotification, setHasNotification] = useState(false);

  // Listen to new incoming friend requests
  useFriendRequestSocket(() => {
    setHasNotification(true);
  }, localStorage.getItem("token"));

  const handleLogout = () => {
    dispatch(authLogout());
    navigate("/login");
  };

  return (
    <aside className="w-20 md:w-24 lg:w-28 h-full bg-gradient-to-b from-teal-600 to-teal-700 dark:from-gray-900 dark:to-gray-950 flex flex-col text-white shadow-lg">
      {/* ===== USER INFO AT TOP ===== */}
      <div
        onClick={() => navigate("/profile")}
        className="flex flex-col items-center gap-1 cursor-pointer group p-4 pb-6"
        title={user?.fullName || "Profile"}
      >
        <div className="relative">
          <img
            src={user?.avatar || "/profileImage.png"}
            alt="avatar"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-white/30 shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-teal-700"></span>
        </div>

        <p className="text-xs md:text-sm font-medium truncate max-w-full px-1 text-center group-hover:text-white/90">
          {user?.fullName?.split(" ")[0] || "You"}
        </p>
      </div>

      <div className="flex-1"></div>

      {/* ===== ACTION ICONS AT BOTTOM ===== */}
      <div className="flex flex-col gap-5 pb-6 px-2 relative">
        {/* Friend Requests */}
        <button
          onClick={() => {
            navigate("/requests");
            setHasNotification(false);
          }}
          title="Friend Requests"
          className="relative p-2 rounded-lg hover:bg-white/10 transition-all hover:scale-110"
        >
          <FaUserFriends size={24} className="mx-auto" />
          {hasNotification && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-teal-700"></span>
          )}
        </button>

        <div className="flex justify-center">
          <ThemeToggle />
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all hover:scale-110"
        >
          <FiLogOut size={24} className="mx-auto" />
        </button>
      </div>
    </aside>
  );
};

export default Footer;
