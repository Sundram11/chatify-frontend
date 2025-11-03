import React from "react";

function Button({
  children,
  bgColor = "bg-blue-600 dark:bg-blue-500",
  textColor = "text-white",
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`
        w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-3 
        rounded-lg font-semibold text-sm sm:text-base 
        transition-all duration-300 ease-in-out 
        ${bgColor} ${textColor}
        hover:opacity-90 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
