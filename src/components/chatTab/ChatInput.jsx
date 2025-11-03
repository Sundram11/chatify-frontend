import React, { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { IoSend } from "react-icons/io5";
import { FiPaperclip, FiX } from "react-icons/fi";
import { Input } from "../index.js";

const ChatInput = memo(({ onSend, disabled }) => {
  const { register, handleSubmit, reset } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // 🟢 Handle file select
  const handleFileSelect = (e) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // 🔵 Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // 🟩 Handle message send
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

  // 🟣 Preview UI (image/video/audio/file)
  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const fileURL = URL.createObjectURL(selectedFile);
    const mime = selectedFile.type;

    if (mime.startsWith("image/")) {
      return (
        <div className="relative mt-1">
          <img
            src={fileURL}
            alt="preview"
            className="max-h-40 rounded-lg border border-gray-300 object-contain"
          />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute top-1 right-1 bg-gray-700 text-white rounded-full p-1 hover:bg-red-500"
          >
            <FiX size={14} />
          </button>
        </div>
      );
    }

    if (mime.startsWith("video/")) {
      return (
        <div className="relative mt-1">
          <video
            src={fileURL}
            controls
            className="max-h-40 rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute top-1 right-1 bg-gray-700 text-white rounded-full p-1 hover:bg-red-500"
          >
            <FiX size={14} />
          </button>
        </div>
      );
    }

    if (mime.startsWith("audio/")) {
      return (
        <div className="relative mt-1 flex items-center gap-2">
          <audio src={fileURL} controls />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="bg-gray-700 text-white rounded-full p-1 hover:bg-red-500"
          >
            <FiX size={14} />
          </button>
        </div>
      );
    }

    // Other files (PDF, DOCX, ZIP, etc.)
    return (
      <div className="relative mt-1 flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50">
        <span className="text-sm text-gray-700 truncate max-w-xs">
          📎 {selectedFile.name}
        </span>
        <button
          type="button"
          onClick={handleRemoveFile}
          className="bg-gray-700 text-white rounded-full p-1 hover:bg-red-500"
        >
          <FiX size={14} />
        </button>
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit(handleSend)}
      className={`border-t border-gray-300 p-2 flex flex-col gap-2 ${
        disabled ? "bg-gray-100 opacity-70 cursor-not-allowed" : "bg-white"
      }`}
    >
      {/* File preview (if any) */}
      {renderFilePreview()}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* File Upload */}
        <label
          className={`cursor-pointer p-2 rounded-full transition ${
            disabled ? "pointer-events-none opacity-50" : "hover:bg-gray-100"
          }`}
        >
          <FiPaperclip size={20} className="text-gray-600" />
          <input
            type="file"
            accept="image/*,video/*,audio/*,application/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isSending}
          />
        </label>

        {/* Text Input */}
        <Input
          {...register("text")}
          placeholder={
            disabled
              ? "You can't send messages in this chat"
              : selectedFile
              ? `Attached: ${selectedFile.name}`
              : "Type a message..."
          }
          className={`flex-1 rounded-full px-4 py-2 text-sm border border-gray-300 focus:outline-none ${
            disabled || isSending
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-50 focus:border-teal-500"
          }`}
          disabled={disabled || isSending}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || isSending}
          className={`p-2 rounded-full transition flex items-center justify-center ${
            disabled || isSending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-teal-600 text-white hover:bg-teal-700"
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
