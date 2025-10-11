import React, { useState } from "react";
import { X, UserCheck, Shield, Mail, Lock, Phone } from "lucide-react";
import { TextInput, TextArea, FileInput, Button } from "../components/form";
import { isEmailValid, isPasswordValid, isPhoneValid, isFileValid } from "../hooks/useFormValidation";
import { PrivacyPolicy } from "./common/modal/PrivacyPolicyModal";

interface ResponderFormProps {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  contactNumber: string;
  setContactNumber: (v: string) => void;
  document: File | null;
  setDocument: (f: File | null) => void;
  notes: string;
  setNotes: (v: string) => void;
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
  privacy?: string;
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
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!isEmailValid(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (!isPasswordValid(password))
      newErrors.password = "Password must be at least 6 characters";
    if (!contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
    else if (!isPhoneValid(contactNumber))
      newErrors.contactNumber = "Must be a valid Philippine mobile number";
    if (!document) newErrors.document = "Verification document is required";
    else if (!isFileValid(document))
      newErrors.document = "Invalid document type (PDF/JPG/PNG only)";
    if (!agreedToPolicy) newErrors.privacy = "You must agree to the Privacy Policy before submitting.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-surface rounded-2xl text-text-default max-h-[90vh] overflow-y-auto scrollbar-hide shadow-xl border border-border-DEFAULT">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-DEFAULT">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-action rounded-xl">
            <UserCheck className="w-6 h-6 text-surface" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Responder Registration</h2>
            <p className="text-sm text-text-muted">Join our emergency response team</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-map-DEFAULT rounded-lg transition-colors text-text-muted hover:text-text-default"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-action bg-opacity-10 border border-action rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-action mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-default">
              Help coordinate relief efforts
            </p>
            <p className="text-xs text-text-muted mt-1">
              All applications are reviewed for verification. You'll be notified once approved.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-text-default">
          Personal Information
        </h3>

        <TextInput
          label="Full Name *"
          value={fullName}
          onChange={setFullName}
          placeholder="Juan Dela Cruz"
          error={errors.fullName}
          icon={<UserCheck className="w-4 h-4 text-text-muted" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Email *"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="juan@example.com"
            error={errors.email}
            icon={<Mail className="w-4 h-4 text-text-muted" />}
          />
          <TextInput
            label="Password *"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Min. 6 characters"
            error={errors.password}
            icon={<Lock className="w-4 h-4 text-text-muted" />}
          />
        </div>

        <TextInput
          label="Contact Number *"
          value={contactNumber}
          onChange={setContactNumber}
          placeholder="09171234567"
          error={errors.contactNumber}
          icon={<Phone className="w-4 h-4 text-text-muted" />}
        />
      </div>

      {/* Verification */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-text-default">Verification</h3>
        <FileInput
          label="Verification Document *"
          file={document}
          onChange={setDocument}
          error={errors.document}
          description="Upload any valid ID or certification (PDF, JPG, PNG) for verification"
        />
      </div>

      {/* Additional Information */}
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-medium text-text-default">
          Additional Information
        </h3>
        <TextArea
          value={notes}
          onChange={setNotes}
          placeholder="Experience, skills, availability, certifications, etc."
          rows={4}
        />
      </div>

      {/* Privacy Policy Agreement */}
      <div className="flex items-start gap-2 mt-4">
        <input
          id="privacyPolicy"
          type="checkbox"
          checked={agreedToPolicy}
          onChange={() => setAgreedToPolicy((p) => !p)}
          className="mt-1 w-4 h-4 accent-action cursor-pointer"
        />
        <label htmlFor="privacyPolicy" className="text-sm text-text-muted leading-relaxed">
          I agree to the{" "}
          <button
            type="button"
            onClick={() => setShowPolicy(true)}
            className="text-action font-medium underline hover:text-action-dark"
          >
            Privacy Policy
          </button>
          .
        </label>
      </div>
      {errors.privacy && (
        <p className="text-xs text-emergency mt-1">{errors.privacy}</p>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicy
        isOpen={showPolicy}
        onClose={() => setShowPolicy(false)}
        onAccept={() => setAgreedToPolicy(true)}
      />

      {/* Global Error */}
      {errorMessage && (
        <div className="p-4 bg-emergency bg-opacity-10 border border-emergency rounded-xl text-sm text-emergency">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        className="w-full py-3 text-base font-semibold font-alt bg-action hover:bg-action-dark transition-colors shadow-lg hover:shadow-xl"
      >
        Submit Application
      </Button>
    </div>
  );
};
