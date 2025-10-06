// ResponderForm.tsx
import React, { useState } from "react";
import { TextInput, TextArea, FileInput, Button } from "../components/form";
import { isEmailValid, isPasswordValid, isPhoneValid, isFileValid } from "../hooks/useFormValidation";
import { UserCheck, X } from "lucide-react";

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
  errorMessage?: string;
  onSubmit: () => void;
  onClose: () => void;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  contactNumber?: string;
  document?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});

  const handleValidation = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!isEmailValid(email)) newErrors.email = "Invalid email format.";
    if (!password) newErrors.password = "Password is required.";
    else if (!isPasswordValid(password)) newErrors.password = "Password must be at least 6 characters.";
    if (!contactNumber) newErrors.contactNumber = "Contact number is required.";
    else if (!isPhoneValid(contactNumber)) newErrors.contactNumber = "Must be a valid Philippine mobile number.";
    if (!document) newErrors.document = "Verification document is required.";
    else if (!isFileValid(document)) newErrors.document = "Invalid document type (PDF/JPG/PNG only).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (handleValidation()) onSubmit();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <UserCheck className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Responder Registration</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          Register as a responder to help coordinate relief efforts in your area. All applications are reviewed for verification.
        </p>
      </div>

      {/* Full Name */}
      <TextInput
        label="Full Name *"
        value={fullName}
        onChange={setFullName}
        placeholder="Juan Dela Cruz"
        error={errors.fullName}
      />

      {/* Email & Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Email *"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="juan@example.com"
          error={errors.email}
        />
        <TextInput
          label="Password *"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Min. 6 characters"
          error={errors.password}
        />
      </div>

      {/* Contact Number */}
      <TextInput
        label="Contact Number *"
        value={contactNumber}
        onChange={setContactNumber}
        placeholder="09171234567"
        error={errors.contactNumber}
      />

      {/* Verification Document */}
      <FileInput
        label="Verification Document *"
        file={document}
        onChange={setDocument}
        error={errors.document}
      />

      {/* Additional Notes */}
      <TextArea
        label="Additional Notes (Optional)"
        value={notes}
        onChange={setNotes}
        placeholder="Experience, skills, availability, or other relevant information..."
      />

      {/* Global Error */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} className="w-full py-3 text-sm sm:text-base font-semibold">
        Submit Application
      </Button>
    </div>
  );
};
