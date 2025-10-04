import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { useAuth } from "./useAuth";

const API_BASE = import.meta.env.VITE_API_URL;

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleRegister = async () => {
    // setIsLoading(true);
    // setError("");
    // setMessage("");
    // try {
    //   const res = await axios.post(`${API_BASE}/auth/register`, {
    //     email,
    //     password,
    //     firstName,
    //     lastName,
    //     middleName,
    //   });
    //   setToken(res.data.token);
    //   setMessage("Registration successful!");
    //   success("Registration successful!");
    //   navigate("/home", { replace: true });
    //   // TODO: Use this when implementing email verification
    //   // navigate('/verify-email', {
    //   //   state: { email },
    //   //   replace: true,
    //   // });
    // } catch (err: unknown) {
    //   const error = err as AxiosError<{ message?: string }>;
    //   setError(error.response?.data?.message || "Registration failed.");
    // } finally {
    //   setIsLoading(false);
    // }
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
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Login failed.");
      // TODO: Use this when adding Email Verification
      // if (error.response?.status === 403) {
      //   navigate('/verify-email', { state: { email } });
      // }
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
