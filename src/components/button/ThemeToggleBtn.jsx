import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../store/themeSlice.js";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  const isLight = mode === "light";

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
      className={`
        flex items-center justify-center 
        p-2.5 sm:p-3 rounded-full
        transition-all duration-300 ease-in-out
        border border-transparent
        hover:scale-105 active:scale-95
        ${isLight 
          ? "bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-sm" 
          : "bg-gray-800 hover:bg-gray-700 text-blue-400 shadow-blue-500/20"
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
      `}
    >
      {isLight ? (
        <Moon
          size={20}
          className="
            transition-transform duration-500 
            rotate-0 scale-100
          "
        />
      ) : (
        <Sun
          size={20}
          className="
            transition-transform duration-500 
            rotate-180 scale-110
            text-yellow-400 drop-shadow-[0_0_4px_rgba(255,215,0,0.6)]
          "
        />
      )}
    </button>
  );
}

export default ThemeToggle;
