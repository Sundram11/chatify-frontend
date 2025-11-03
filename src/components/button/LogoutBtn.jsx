import React from "react";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { authLogout } from "../../store/AuthSlice.js";
import authService from "../../backendServices/auth.js";
import { useNavigate } from "react-router-dom"; // ← Add this

function LogoutBtn({ onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ← Add this

  const logout = async () => {
    try {
      await authService.logout();
      dispatch(authLogout());
      console.log("Logout successful");

      // Redirect to login page
      navigate("/login", { replace: true });

      onLogout?.();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <button
    className="flex items-center w-full px-3 py-2 hover:bg-red-600/80 text-gray-200 gap-2"
      onClick={logout}
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
}

export default LogoutBtn;