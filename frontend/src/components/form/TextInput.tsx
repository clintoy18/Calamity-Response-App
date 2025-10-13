import React from "react";
import { motion, type Variants } from "framer-motion";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  onBlur?: () => void;
  icon?: React.ReactNode;
  min?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 300 }
  }
};

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  onBlur,
  icon,
  min,
}) => (
  <motion.div 
    className="space-y-1"
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
  >
    <label className="block text-xs font-medium text-gray-900">{label}</label>
    <div className="relative">
      {icon && (
        <motion.div 
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {icon}
        </motion.div>
      )}
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        whileFocus={{ scale: 1.005 }}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 bg-white border rounded-xl transition-all duration-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
        }`}
      />
    </div>
    {error && (
      <motion.p 
        className="text-xs text-red-600"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {error}
      </motion.p>
    )}
  </motion.div>
);