import React, { useState, useEffect } from "react";
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  errors?: string;
  isLoading?: boolean;
  successMessage?: string;
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

  useEffect(() => {
    if (errors) {
      setLocalError("");
    }
  }, [errors]);

  useEffect(() => {
    if (successMessage && isOpen) {
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

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    await onLogin(email, password);
    window.location.reload();
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setLocalError("");
    setShowPassword(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  const displayError = localError || errors;
  const isLoading = externalIsLoading || false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-strong w-full max-w-md overflow-hidden border border-border">
        {/* Header with Emergency Branding */}
        <div className="bg-gradient-to-br from-emergency/5 to-transparent px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-8 bg-emergency rounded-full"></div>
                <h2 className="text-3xl font-display font-bold text-text tracking-tight">
                  Respondent Login
                </h2>
              </div>
              <p className="text-sm font-sans text-text-muted leading-relaxed">
                Sign in to verify and respond to emergency assistance requests
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-text-light hover:text-text transition-colors p-2 hover:bg-map rounded-lg -mt-1 -mr-2"
              disabled={isLoading}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 space-y-5 bg-background">
          {/* Error Message */}
          {displayError && (
            <div className="bg-emergency/5 border-l-4 border-emergency text-emergency px-4 py-3.5 rounded-lg flex items-start gap-3 shadow-soft animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-sans font-medium">{displayError}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-heading font-semibold text-text"
            >
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-action transition-colors" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="responder@example.com"
                className="w-full pl-12 pr-4 py-3.5 font-sans bg-surface border-2 border-border rounded-xl focus:ring-2 focus:ring-action/20 focus:border-action outline-none transition-all placeholder:text-text-light disabled:bg-map disabled:text-text-muted disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-heading font-semibold text-text"
            >
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-action transition-colors" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3.5 font-sans bg-surface border-2 border-border rounded-xl focus:ring-2 focus:ring-action/20 focus:border-action outline-none transition-all placeholder:text-text-light disabled:bg-map disabled:text-text-muted disabled:cursor-not-allowed"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors p-1.5 rounded-lg hover:bg-map"
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full mt-2 px-6 py-4 rounded-xl font-alt font-bold text-base transition-all duration-200 focus:outline-none focus:ring-4 flex items-center justify-center gap-2 shadow-soft ${
              isLoading
                ? "bg-border text-text-muted cursor-not-allowed"
                : "bg-emergency text-white hover:bg-emergency/90 focus:ring-emergency/20 active:scale-[0.98] hover:shadow-medium"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              "Sign In to Respond"
            )}
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background font-sans text-text-muted">
                New to the platform?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            className="w-full border-2 border-action text-action py-3.5 rounded-xl font-alt font-semibold hover:bg-action hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-soft hover:shadow-medium"
            disabled={isLoading}
          >
            Apply as Emergency Respondent
          </button>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 bg-map/30 border-t border-border">
          <p className="text-xs font-sans text-text-muted text-center">
            Secure authentication for verified emergency response personnel
          </p>
        </div>
      </div>
    </div>
  );
};