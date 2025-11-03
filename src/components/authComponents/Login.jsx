import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button } from "../index.js";
import { authLogin } from "../../store/AuthSlice.js";
import { useDispatch } from "react-redux";
import authService from "../../backendServices/auth.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from "./GoogleLogin.jsx";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
    reset,
  } = useForm();
  const [serverError, setServerError] = useState("");

  const login = async (data) => {
    setServerError("");
    try {
      const userData = await authService.login(data);

      dispatch(
        authLogin({
          user: userData.data.user,
          accessToken: userData.data.accessToken,
          refreshToken: userData.data.refreshToken,
        })
      );

      reset();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error?.response?.data || error.message);
      setServerError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      reset();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Google Login */}

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Welcome Back
        </h2>
        <div className="mb-6 flex justify-center border-b-2 pb-6">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin />
          </GoogleOAuthProvider>
        </div>

        {/* Heading */}
        

        {/* Server Error */}
        {serverError && (
          <p className="text-red-600 dark:text-red-400 text-center mb-4 text-sm sm:text-base">
            {serverError}
          </p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(login)} className="space-y-5 sm:space-y-6">
          {/* Email */}
          <div>
            <Input
              label="Email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              label="Password"
              placeholder="Enter Password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
            />
            {errors.password && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 
              dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg 
              font-semibold transition-all duration-300"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          {/* Signup Link */}
          <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 mt-3">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-blue-500 dark:text-blue-400 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
