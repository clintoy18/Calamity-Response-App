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

  const handleRegister = async () => {
    // Keep your existing implementation
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

      // ✅ Handle verification error specifically
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
