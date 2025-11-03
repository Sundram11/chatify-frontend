import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Settings, Search, User } from "lucide-react";
import {LogoutBtn, ThemeToggle, Input} from "../index.js";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { register, handleSubmit, reset } = useForm();

  // 🧩 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 Handle search form submit
  const handleSearch = (data) => {
    const query = data.search?.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    reset();
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        <div className="bg-blue-600 rounded-full p-2 text-white font-bold">
          Chat
        </div>
        <span className="text-white font-semibold text-lg hidden sm:block">
          ChatApp
        </span>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSubmit(handleSearch)}
        className="flex items-center w-full max-w-md mx-4"
      >
        <div className="relative w-full">
          <Input
            {...register("search")}
            placeholder="Search chats or users..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </form>

      {/* Settings menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-300"
        >
          <Settings className="w-6 h-6" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-lg py-2 z-50">
            <ThemeToggle />

            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              className="flex items-center w-full px-3 py-2 hover:bg-gray-700 text-gray-200 gap-2"
            >
              <User size={18} /> <span>Profile</span>
            </button>

             <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/requests");
              }}
              className="flex items-center w-full px-3 py-2 hover:bg-gray-700 text-gray-200 gap-2"
            >
              <User size={18} /> <span>Reqests</span>
            </button>

            <LogoutBtn onLogout={() => setMenuOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
