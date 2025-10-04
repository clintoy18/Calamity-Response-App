import React, { useState, useEffect } from "react";
import { X, Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  errors?: string;
  isLoading?: boolean;
  successMessage?: string; // Add success message to detect successful login
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  errors,
  isLoading: externalIsLoading,
  successMessage,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  // Clear local error when external errors change
  useEffect(() => {
    if (errors) {
      setLocalError("");
    }
  }, [errors]);

  // Close modal on successful login
  useEffect(() => {
    if (successMessage && isOpen) {
      // Clear form and close
      setEmail("");
      setPassword("");
      setLocalError("");
      setShowPassword(false);
      onClose();
    }
  }, [successMessage, isOpen, onClose]);

  // Close modal on successful login
  useEffect(() => {
    if (successMessage && isOpen) {
      // Clear form and close
      setEmail("");
      setPassword("");
      setLocalError("");
      setShowPassword(false);
      onClose();
    }
  }, [successMessage, isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Client-side validation
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    // Call the parent's login function
    // Don't close modal here - let parent handle success navigation
    await onLogin(email, password);
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setLocalError("");
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  // Display either local validation errors or errors from parent
  const displayError = localError || errors;
  const isLoading = externalIsLoading || false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <h3 className="text-white text-sm">
              Be an official Respondent and confirm emergency requests as
              resolved.
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {displayError}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-[45%] -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full mb-2 pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[45%] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            className="w-full border-2 border-blue-500 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
            disabled={isLoading}
          >
            Apply as Respondent
          </button>
        </form>
      </div>
    </div>
  );
};
