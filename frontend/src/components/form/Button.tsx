import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  variant = "primary",
  disabled,
  ...props
}) => {
  const base = "w-full rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
  const styles = {
    primary: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97] focus:ring-gray-900",
    secondary: disabled
      ? "border-2 border-gray-200 text-gray-400 cursor-not-allowed"
      : "border-2 border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-gray-50 focus:ring-gray-300",
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${base} ${styles[variant]}`}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isLoading ? "Processing..." : children}
    </button>
  );
};
