// Button.tsx
import React from 'react';
import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'success' | 'warning';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  label?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  fullWidth = false,
  variant = 'primary',
  iconOnly = false,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-alt font-semibold transition-all duration-150 active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-action text-white hover:bg-action-dark focus:ring-action',
    secondary: 'bg-surface text-text border border-border hover:bg-background focus:ring-border',
    emergency: 'bg-emergency text-white hover:bg-brand-dark focus:ring-emergency',
    success: 'bg-accent-teal text-white hover:bg-accent-teal/80 focus:ring-accent-teal',
    warning: 'bg-accent-purple text-white hover:bg-accent-purple/80 focus:ring-accent-purple',
  };

  const padding = iconOnly ? 'p-2.5 aspect-square' : 'px-3 py-2';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${padding} ${
        fullWidth ? 'w-full' : ''
      } ${iconOnly ? 'rounded-full' : ''} ${className}`}
      title={iconOnly ? label : undefined}
      {...props}
    >
      {icon && (
        <span className={`${!iconOnly && label ? 'mr-1' : ''} inline-flex items-center`}>
          {icon}
        </span>
      )}
      {!iconOnly && label && <span className="truncate">{label}</span>}
    </motion.button>
  );
};
