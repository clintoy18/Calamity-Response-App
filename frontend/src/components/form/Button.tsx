import React from 'react';
import { Loader2 } from 'lucide-react';
// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary',
  disabled,
  ...props 
}) => {
  const baseStyles = "w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles = {
    primary: disabled 
      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
      : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 active:scale-[0.98]",
    secondary: disabled
      ? "border-2 border-gray-200 text-gray-400 cursor-not-allowed"
      : "border-2 border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-gray-50 focus:ring-gray-300"
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} flex items-center justify-center gap-2`}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isLoading ? "Processing..." : children}
    </button>
  );
};
