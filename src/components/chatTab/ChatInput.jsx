import React, { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { IoSend } from "react-icons/io5";
import { FiPaperclip, FiX } from "react-icons/fi";
import { Input } from "../index.js";

const ChatInput = memo(({ onSend, disabled }) => {
  const { register, handleSubmit, reset } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleFileSelect = (e) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleRemoveFile = () => setSelectedFile(null);

  const handleSend = async (data) => {
    if (disabled || isSending) return;

    const text = data.text?.trim();
    if (!text && !selectedFile) return;

    try {
      setIsSending(true);
      await onSend({ text, file: selectedFile });
      reset();
      setSelectedFile(null);
    } finally {
      setIsSending(false);
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;
    const fileURL = URL.createObjectURL(selectedFile);
    const mime = selectedFile.type;

    const closeBtn = (
      <button
        type="button"
        onClick={handleRemoveFile}
        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition"
      >
        <FiX size={14} />
      </button>
    );

    if (mime.startsWith("image/"))
      return (
        <div className="relative mt-1">
          <img
            src={fileURL}
            alt="preview"
            className="max-h-40 rounded-lg border border-gray-300 object-contain shadow-sm"
          />
          {closeBtn}
        </div>
      );

    if (mime.startsWith("video/"))
      return (
        <div className="relative mt-1">
          <video
            src={fileURL}
            controls
            className="max-h-40 rounded-lg border border-gray-300 shadow-sm"
          />
          {closeBtn}
        </div>
      );

    if (mime.startsWith("audio/"))
      return (
        <div className="relative mt-1 flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg p-2">
          <audio src={fileURL} controls />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="bg-gray-700 text-white rounded-full p-1 hover:bg-red-500 transition"
          >
            <FiX size={14} />
          </button>
        </div>
      );

    return (
      <div className="relative mt-1 flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50">
        <span className="text-sm text-gray-700 truncate max-w-xs">
          📎 {selectedFile.name}
        </span>
        <button
          type="button"
          onClick={handleRemoveFile}
          className="bg-gray-700 text-white rounded-full p-1 hover:bg-red-500 transition"
        >
          <FiX size={14} />
        </button>
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit(handleSend)}
      className={`border-t border-gray-300 px-3 py-2 flex flex-col gap-2 ${
        disabled ? "bg-gray-100 opacity-70 cursor-not-allowed" : "bg-white dark:bg-gray-900"
      }`}
    >
      {/* Preview */}
      {renderFilePreview()}

      <div className="flex items-center gap-2">
        {/* Attach file */}
        <label
          className={`cursor-pointer p-2 rounded-full transition ${
            disabled ? "opacity-50 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <FiPaperclip size={20} className="text-gray-600 dark:text-gray-300" />
          <input
            type="file"
            accept="image/*,video/*,audio/*,application/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isSending}
          />
        </label>

        {/* Input field */}
        <Input
          {...register("text")}
          placeholder={
            disabled
              ? "You can’t send messages in this chat"
              : selectedFile
              ? `Attached: ${selectedFile.name}`
              : "Type a message..."
          }
          className={`flex-1 rounded-full px-4 py-2 text-sm border border-gray-300 focus:outline-none ${
            disabled || isSending
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-50 dark:bg-gray-800 focus:border-teal-500 dark:text-white"
          }`}
          disabled={disabled || isSending}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || isSending}
          className={`p-2.5 rounded-full flex items-center justify-center shadow-sm transition ${
            disabled || isSending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {isSending ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
          ) : (
            <IoSend size={20} />
          )}
        </button>
      </div>
    </form>
  );
});

export default ChatInput;
