import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import Footer from "./components/footer/Footer";

export default function App() {
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    if (!user) navigate("/login");
  }, [user, mode]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden">
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet  />
      </main>

     
    </div>
  );
}
