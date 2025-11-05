import React, { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  {
    label,
    placeholder = "",
    type = "text",
    className = "",
    error = "",
    disabled = false,
    size = "md", // "sm", "md", "lg"
    ...props
  },
  ref
) {
  const id = useId();

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg",
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-lg border transition-all duration-300 outline-none
          ${sizeClasses[size]}
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          }
          bg-white dark:bg-gray-700
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-400
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  );
});

export default Input;
