import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, LogOut, Users } from "lucide-react";
import { ThemeToggle } from "../index.js";
import { useDispatch } from "react-redux";
import { authLogout } from "../../store/AuthSlice.js";

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(authLogout());
    navigate("/login");
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-gray-900 dark:to-gray-950 border-b border-gray-800 sticky top-0 z-50 shadow-md transition-colors duration-300">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <div className="bg-white dark:bg-teal-500 text-teal-700 dark:text-white rounded-full px-3 py-1 font-bold shadow-sm">
          Chat
        </div>
        <span className="text-white font-semibold text-lg hidden sm:block tracking-wide">
          Connect
        </span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4 text-white/90">
        <button
          onClick={() => navigate("/search")}
          title="Search"
          className="hover:text-white transition-transform duration-200 hover:scale-110"
        >
          <Search size={22} />
        </button>

        <button
          onClick={() => navigate("/requests")}
          title="Requests"
          className="hover:text-white transition-transform duration-200 hover:scale-110"
        >
          <Users size={22} />
        </button>

        <button
          onClick={() => navigate("/profile")}
          title="Profile"
          className="hover:text-white transition-transform duration-200 hover:scale-110"
        >
          <User size={22} />
        </button>

        <ThemeToggle />

        <button
          onClick={handleLogout}
          title="Logout"
          className="hover:text-red-400 transition-transform duration-200 hover:scale-110"
        >
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
};

export default Footer;
