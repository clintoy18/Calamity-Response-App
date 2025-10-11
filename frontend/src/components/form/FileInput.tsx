import React from "react";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload } from "lucide-react";

interface FileInputProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
  description?: string;
}

// ✅ Type-safe variants (explicitly cast as Variants)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, damping: 20, stiffness: 300 }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
};

export const FileInput: React.FC<FileInputProps> = ({
  label,
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  error,
  description,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.files?.[0] || null);

  return (
    <motion.div
      className="space-y-1"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <label className="block text-xs font-medium text-gray-900">{label}</label>

      <motion.label
        className={`group relative flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-xs ${
          error
            ? "border-red-300 bg-red-50/50 hover:bg-red-50"
            : file
            ? "border-gray-300 bg-gray-50"
            : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file-present"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              >
                <FileText className="w-5 h-5 text-gray-600 mb-1" />
              </motion.div>
              <p className="truncate max-w-full font-medium text-gray-900">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file-empty"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Upload className="w-5 h-5 text-gray-400 mb-1 group-hover:text-gray-700 transition-colors" />
              </motion.div>
              <p className="font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                {description || "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {accept.toUpperCase().split(",").join(", ")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.label>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            className="text-xs text-red-600"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
