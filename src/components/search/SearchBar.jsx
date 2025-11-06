// src/components/search/SearchBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "../index.js";

const SearchBar = ({ 
  initialQuery = "", 
  placeholder = "Search users...", 
  className = "" 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-teal-500 transition-all ${className}`}
    >
      <Search className="text-gray-500 dark:text-gray-400 w-5 h-5 mr-2 flex-shrink-0" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent flex-1 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-none focus:outline-none"
      />
    </form>
  );
};

export default SearchBar;