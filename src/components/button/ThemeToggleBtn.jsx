import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../store/themeSlice.js";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
      className="
        flex items-center justify-center
        p-2 sm:p-2.5 lg:p-3
        rounded-full
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        border border-gray-300 dark:border-gray-600
        shadow-sm hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-[hsl(210,70%,60%)] focus:ring-offset-2
        transition-all duration-300 ease-in-out
      "
    >
      {mode === "light" ? (
        <Moon
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-gray-800 dark:text-gray-100 transition-all duration-300"
        />
      ) : (
        <Sun
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-yellow-400 transition-all duration-300"
        />
      )}
    </button>
  );
}

export default ThemeToggle;
