import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { useAuth } from "./useAuth";
import { getUserRole } from "../utils/authUtils";

const API_BASE = import.meta.env.VITE_API_URL;

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleRegister = async (
    email: string,
    password: string,
    name?: string,
    role?: string
  ) => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password,
        name,
        role,
      });

      setMessage(
        res.data.message || 
        "Registration successful! Please wait for admin approval."
      );
      
      // Optionally redirect to login page after successful registration
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(
        error.response?.data?.message || 
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      setToken(res.data.token);
      setMessage("Login successful!");
      console.log("Login successful!");

      // Redirect based on user role
      const userRole = getUserRole();
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "respondent") {
        navigate("/respondent/dashboard", { replace: true });
      } else {
        // Fallback if role is not recognized
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string; code?: string }>;

      // Handle verification error specifically
      if (
        error.response?.status === 403 &&
        error.response?.data?.code === "ACCOUNT_NOT_VERIFIED"
      ) {
        setError(
          "Your account is pending verification. Please wait for admin approval."
        );
      } else {
        setError(error.response?.data?.message || "Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  return {
    handleRegister,
    handleLogin,
    clearMessages,
    isLoading,
    errors,
    message,
  };
}