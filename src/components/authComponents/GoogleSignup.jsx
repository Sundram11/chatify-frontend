import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import authService from "../../backendServices/auth.js";
import { useDispatch } from "react-redux";
import { authLogin } from "../../store/AuthSlice.js";
import { useNavigate } from "react-router-dom";

const GoogleSignup = ({ text = "Signup with Google" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signup = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (response) => {
      const codeToSend = response.code;
      if (!codeToSend) return;

      try {
        const userData = await authService.googleSignup({ code: codeToSend });
        dispatch(
          authLogin({
            user: userData.data.user,
            accessToken: userData.data.accessToken,
            refreshToken: userData.data.refreshToken,
          })
        );
        navigate("/");
      } catch {
        // Optional: show toast or UI error
      }
    },
  });

  return (
    <button
      onClick={signup}
      className="flex items-center justify-center gap-3 w-full sm:w-auto 
        px-4 sm:px-5 py-2 sm:py-3 rounded-lg border border-gray-300 
        bg-white dark:bg-gray-800 shadow-sm 
        hover:bg-gray-100 dark:hover:bg-gray-700 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition-all duration-300"
    >
      <img
        src="/image.png" // ✅ public assets should be referenced like this in Vite
        alt="Google Icon"
        className="w-5 h-5 object-contain"
      />
      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base">
        {text}
      </span>
    </button>
  );
};

export default GoogleSignup;
