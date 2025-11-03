import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import authService from "../../backendServices/auth.js";
import { useDispatch } from "react-redux";
import { authLogin } from "../../store/AuthSlice.js";
import { useNavigate } from "react-router-dom";

const GoogleLogin = ({ text = "Sign in with Google" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (response) => {
      const codeToSend = response.code;
      if (!codeToSend) return;

      try {
        const res = await authService.goolgeLogin({ code: codeToSend });
        dispatch(
          authLogin({
            user: res.data.user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          })
        );
        navigate("/");
      } catch {
        // Silent fail — optionally show a toast or UI message
      }
    },
  });

  return (
    <button
      onClick={login}
      className="flex items-center justify-center gap-3 w-full sm:w-auto 
        px-4 sm:px-5 py-2 sm:py-3 rounded-lg border border-gray-300 
        bg-white dark:bg-gray-800 shadow-sm 
        hover:bg-gray-100 dark:hover:bg-gray-700 
        focus:outline-none focus:ring-2 focus:ring-blue-400 
        transition-all duration-300"
    >
      <img
        src="/image.png"
        alt="Google Icon"
        className="w-5 h-5 object-contain"
      />
      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base">
        {text}
      </span>
    </button>
  );
};

export default GoogleLogin;
