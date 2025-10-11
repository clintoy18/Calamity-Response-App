import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { X, MapPin, AlertCircle, Users, Clock } from "lucide-react";
import type { Location, NeedType } from "../types";
import { needOptions } from "../constants";
import { TextInput, TextArea, FileInput, Button } from "../components/form";
import { PrivacyPolicy } from "./common/modal/PrivacyPolicyModal";

interface EmergencyFormProps {
  location: Location;
  placeName: string;
  contactNo: string;
  setContactNo: (value: string) => void;
  selectedNeeds: NeedType[];
  toggleNeed: (need: NeedType) => void;
  numberOfPeople: number;
  setNumberOfPeople: (value: number) => void;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  setUrgencyLevel: (level: "low" | "medium" | "high" | "critical") => void;
  additionalNotes: string;
  setAdditionalNotes: (value: string) => void;
  errorMessage?: string;
  onSubmit: () => void;
  onClose: () => void;
  emergencyDocument: File | null;
  setEmergencyDocument: (file: File | null) => void;
}

// Animation presets
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const EmergencyForm: React.FC<EmergencyFormProps> = ({
  location,
  placeName,
  contactNo,
  setContactNo,
  selectedNeeds,
  toggleNeed,
  numberOfPeople,
  setNumberOfPeople,
  urgencyLevel,
  setUrgencyLevel,
  additionalNotes,
  setAdditionalNotes,
  errorMessage,
  onSubmit,
  onClose,
  emergencyDocument,
  setEmergencyDocument,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactName, setContactName] = useState("");
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!contactName?.trim()) newErrors.contactName = "Contact name is required";
    if (!contactNo?.trim()) newErrors.contactNo = "Contact number is required";
    else if (!/^09\d{9}$/.test(contactNo)) newErrors.contactNo = "Invalid Philippine mobile number";
    if (!selectedNeeds.length) newErrors.selectedNeeds = "Select at least one need";
    if (!numberOfPeople || numberOfPeople < 1) newErrors.numberOfPeople = "Must be at least 1 person";
    if (!urgencyLevel) newErrors.urgencyLevel = "Select urgency level";
    if (!emergencyDocument) newErrors.emergencyDocument = "Verification document is required";
    if (!isPrivacyAccepted) newErrors.privacyPolicy = "You must accept the Privacy Policy";
    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = () => {
    if (validateForm()) onSubmit();
  };

  return (
    <motion.div
      className="p-6 space-y-6 bg-surface rounded-2xl text-text-default max-h-[90vh] overflow-y-auto scrollbar-hide shadow-xl border border-border-DEFAULT"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center pb-4 border-b border-border-DEFAULT"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emergency rounded-xl">
            <AlertCircle className="w-6 h-6 text-surface" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Emergency Relief Request</h2>
            <p className="text-sm text-text-muted">Submit your emergency assistance needs</p>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          className="p-2 hover:bg-map-DEFAULT rounded-lg transition-colors text-text-muted hover:text-text-default"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Location Info */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-map-DEFAULT border border-border-strong rounded-xl"
      >
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emergency mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">{placeName || "Fetching location..."}</p>
            <p className="text-xs text-text-muted mt-1">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-text-default">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Contact Name *"
            value={contactName}
            onChange={setContactName}
            placeholder="Full Name"
            error={errors.contactName}
          />
          <TextInput
            label="Contact Number *"
            value={contactNo}
            onChange={setContactNo}
            placeholder="09171234567"
            error={errors.contactNo}
          />
        </div>
      </motion.div>

      {/* Emergency Details */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-text-default">Emergency Details</h3>
        {/* Needs */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Required Assistance *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {needOptions.map((option, index) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => toggleNeed(option.value as NeedType)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedNeeds.includes(option.value as NeedType)
                    ? "border-emergency bg-emergency text-surface shadow-sm"
                    : "border-border-DEFAULT bg-surface text-text-muted hover:border-emergency hover:bg-map-DEFAULT hover:text-text-default"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.03 }}
              >
                <div
                  className={`mb-2 ${
                    selectedNeeds.includes(option.value as NeedType)
                      ? "text-surface"
                      : "text-text-muted"
                  }`}
                >
                  {option.icon}
                </div>
                <span className="text-xs font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>
          {errors.selectedNeeds && (
            <p className="text-xs text-emergency mt-2">{errors.selectedNeeds}</p>
          )}
        </div>

        {/* People & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-text-muted" />
              Number of People *
            </label>
            <TextInput
              label=""
              type="number"
              value={numberOfPeople.toString()}
              onChange={(val) => setNumberOfPeople(Number(val))}
              error={errors.numberOfPeople}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-text-muted" />
              Urgency Level *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["low", "medium", "high", "critical"] as const).map((level) => {
                const colorMap = {
                  low: "bg-green-50 border-green-500 text-green-700",
                  medium: "bg-yellow-50 border-yellow-500 text-yellow-700",
                  high: "bg-orange-50 border-orange-500 text-orange-700",
                  critical: "bg-emergency border-emergency text-surface",
                };
                return (
                  <motion.button
                    key={level}
                    type="button"
                    onClick={() => setUrgencyLevel(level)}
                    className={`px-3 py-2 rounded-lg border-2 font-medium text-xs transition-all ${
                      urgencyLevel === level
                        ? `${colorMap[level]} shadow-sm`
                        : "border-border-DEFAULT bg-surface text-text-muted hover:border-text-default"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </motion.button>
                );
              })}
            </div>
            {errors.urgencyLevel && (
              <p className="text-xs text-emergency mt-2">{errors.urgencyLevel}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Verification */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-heading text-lg font-medium text-text-default">Verification</h3>
        <FileInput
          label="Verification Document *"
          file={emergencyDocument}
          onChange={setEmergencyDocument}
          error={errors.emergencyDocument}
          description="Upload any document that verifies your emergency situation (PDF, JPG, PNG)"
        />
      </motion.div>

      {/* Additional Notes */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="font-heading text-lg font-medium text-text-default">
          Additional Information
        </h3>
        <TextArea
          value={additionalNotes}
          onChange={setAdditionalNotes}
          placeholder="Special needs, medical conditions, accessibility requirements, etc."
          rows={4}
        />
      </motion.div>

      {/* ✅ Privacy Policy Agreement */}
      <motion.div variants={itemVariants} className="flex items-start gap-2 mt-2">
        <input
          type="checkbox"
          checked={isPrivacyAccepted}
          onChange={() => setIsPrivacyAccepted(!isPrivacyAccepted)}
          className="mt-1 w-4 h-4 accent-emergency"
        />
        <p className="text-sm text-text-muted">
          I agree to the{" "}
          <button
            type="button"
            onClick={() => setShowPolicy(true)}
            className="text-emergency underline font-medium hover:text-emergency-dark"
          >
            Privacy Policy
          </button>
          .
        </p>
      </motion.div>
      {errors.privacyPolicy && (
        <p className="text-xs text-emergency mt-1">{errors.privacyPolicy}</p>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-emergency bg-opacity-10 border border-emergency rounded-xl text-sm text-emergency">
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <motion.div variants={itemVariants}>
        <Button
          onClick={handleSubmit}
          disabled={!isPrivacyAccepted}
          className={`w-full py-3 text-base font-semibold font-alt rounded-lg transition ${
            isPrivacyAccepted
              ? "bg-emergency text-surface hover:bg-brand-dark shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Emergency Request
        </Button>
      </motion.div>

      {/* ✅ Privacy Policy Modal */}
      <PrivacyPolicy
        isOpen={showPolicy}
        onClose={() => setShowPolicy(false)}
        onAccept={() => setIsPrivacyAccepted(true)}
      />
    </motion.div>
  );
};
