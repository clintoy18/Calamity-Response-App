import React from "react";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  error?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 300 }
  }
};

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  error,
}) => (
  <motion.div 
    className="space-y-1"
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
  >
    {label && (
      <label className="block text-xs font-medium text-gray-900">{label}</label>
    )}
    <motion.textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      whileFocus={{ scale: 1.005 }}
      className={`w-full px-3 py-2 bg-white border rounded-xl transition-all duration-200 resize-none text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
        error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
      }`}
    />
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