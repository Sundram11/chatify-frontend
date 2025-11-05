import React from "react";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { authLogout } from "../../store/AuthSlice.js";
import authService from "../../backendServices/auth.js";
import { useNavigate } from "react-router-dom";

function LogoutBtn({ onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authService.logout();
      dispatch(authLogout());
      console.log("Logout successful");
      navigate("/login", { replace: true });
      onLogout?.();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <button
      onClick={logout}
      className="
        flex items-center w-full px-3 sm:px-4 py-2.5 gap-2 
        text-sm sm:text-base font-medium rounded-lg
        text-gray-200 dark:text-gray-100
        hover:bg-red-600/80 active:bg-red-700
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500
      "
    >
      <LogOut size={18} className="shrink-0" />
      <span className="truncate">Logout</span>
    </button>
  );
}

export default LogoutBtn;
