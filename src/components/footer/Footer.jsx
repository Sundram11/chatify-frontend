import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";           // Logout
import { FaUserFriends } from "react-icons/fa";       // Friend Requests
import { ThemeToggle } from "../index.js";
import { useDispatch, useSelector } from "react-redux";
import { authLogout } from "../../store/AuthSlice.js";

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

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

      {/* ===== FLEX GROW SPACER ===== */}
      <div className="flex-1"></div>

      {/* ===== ACTION ICONS AT BOTTOM ===== */}
      <div className="flex flex-col gap-5 pb-6 px-2">

        {/* Friend Requests */}
        <button
          onClick={() => navigate("/requests")}
          title="Friend Requests"
          className="p-2 rounded-lg hover:bg-white/10 transition-all hover:scale-110"
        >
          <FaUserFriends size={24} className="mx-auto" />
        </button>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>

        {/* Logout */}
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