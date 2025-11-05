import React from "react";

function Button({
  children,
  bgColor = "bg-blue-600 dark:bg-blue-500",
  textColor = "text-white dark:text-gray-100",
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
        inline-flex items-center justify-center
        w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3
        rounded-xl font-medium text-sm sm:text-base
        tracking-wide whitespace-nowrap
        transition-all duration-300 ease-in-out
        shadow-sm hover:shadow-md active:scale-[0.97]
        focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${bgColor} ${textColor}
        hover:opacity-95
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
