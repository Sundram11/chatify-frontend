import React, { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  { label, placeholder = "", type = "text", className = "", ...props },
  ref
) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2 w-full">
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
        className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 sm:py-3 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
          placeholder-gray-400 dark:placeholder-gray-400 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          outline-none transition-all duration-300 ${className}`}
        {...props}
      />
    </div>
  );
});

export default Input;
