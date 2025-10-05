import React, { useState } from "react";
import { X, FileText } from "lucide-react";

interface ResponderFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  contactNumber: string;
  setContactNumber: (value: string) => void;
  document: File | null;
  setDocument: (file: File | null) => void;
  notes: string;
  setNotes: (value: string) => void;
  errorMessage: string;
  onSubmit: () => void;
  onClose: () => void;
}

export const ResponderForm: React.FC<ResponderFormProps> = ({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  contactNumber,
  setContactNumber,
  document,
  setDocument,
  notes,
  setNotes,
  errorMessage,
  onSubmit,
  onClose,
}) => {
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    contactNumber?: string;
    document?: string;
  }>({});

  // Validation helpers
  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value: string) =>
    value.length >= 6; // Example: min 6 characters
  const validateContact = (value: string) =>
    /^\d{10,15}$/.test(value); // Example: 10-15 digits
  const validateDocument = (file: File | null) =>
    file && ["application/pdf", "image/jpeg", "image/png"].includes(file.type);

  const handleValidation = () => {
    const errors: typeof fieldErrors = {};

    if (!fullName.trim()) errors.fullName = "Full Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(email)) errors.email = "Invalid email format.";
    if (!password) errors.password = "Password is required.";
    else if (!validatePassword(password))
      errors.password = "Password must be at least 6 characters.";
    if (!contactNumber) errors.contactNumber = "Contact Number is required.";
    else if (!validateContact(contactNumber))
      errors.contactNumber = "Invalid contact number.";
    if (!document) errors.document = "Verification Document is required.";
    else if (!validateDocument(document))
      errors.document = "Invalid document type (PDF/JPG/PNG).";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (handleValidation()) onSubmit();
  };

  return (
    <div className="p-6 bg-white rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Apply as Responder
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={handleValidation}
            placeholder="e.g. Juan Dela Cruz"
            className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldErrors.fullName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {fieldErrors.fullName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleValidation}
            placeholder="e.g. juan@email.com"
            className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldErrors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handleValidation}
            placeholder="••••••••"
            className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldErrors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {fieldErrors.password && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            onBlur={handleValidation}
            placeholder="e.g., 09171234567"
            className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldErrors.contactNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {fieldErrors.contactNumber && (
            <p className="text-xs text-red-600 mt-1">
              {fieldErrors.contactNumber}
            </p>
          )}
        </div>

        {/* Verification Document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verification Document <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3 bg-gray-50 border rounded-lg p-2 border-gray-300">
            <FileText className="w-5 h-5 text-gray-500" />
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocument(e.target.files?.[0] || null)}
              onBlur={handleValidation}
              className="text-sm text-gray-700 w-full"
            />
          </div>
          {document && (
            <p className="mt-1 text-xs text-gray-500 truncate">
              Selected: {document.name}
            </p>
          )}
          {fieldErrors.document && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.document}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Why do you want to be a responder?)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Tell us your motivation..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"
          />
        </div>

        {/* Global Error */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
};
