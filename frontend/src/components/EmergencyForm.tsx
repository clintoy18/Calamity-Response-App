import React, { useState } from "react";
import { X, MapPin, AlertCircle } from "lucide-react";
import type { Location, NeedType } from "../types";
import { needOptions } from "../constants";
import { TextInput, TextArea, FileInput, Button } from "../components/form";

interface EmergencyFormProps {
  contactName: string;
  setContactName: (value: string) => void;
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

export const EmergencyForm: React.FC<EmergencyFormProps> = ({
  contactName,
  setContactName,
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // if (!(contactName?.trim())) newErrors.contactName = "Contact name is required.";
    if (!(contactNo?.trim())) newErrors.contactNo = "Contact number is required.";
    else if (!/^09\d{9}$/.test(contactNo))
      newErrors.contactNo = "Must be a valid Philippine mobile number.";

    if (!selectedNeeds || selectedNeeds.length === 0)
      newErrors.selectedNeeds = "Select at least one need.";

    if (!numberOfPeople || numberOfPeople < 1)
      newErrors.numberOfPeople = "Number of people must be at least 1.";

    if (!urgencyLevel) newErrors.urgencyLevel = "Select urgency level.";

    if (!emergencyDocument) newErrors.emergencyDocument = "Verification document is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) onSubmit();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-50 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Emergency Relief Request
          </h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Location */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
        <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {placeName || "Fetching location..."}
          </p>
          <p className="text-xs text-gray-500">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Contact Name */}
      <TextInput
        label="Contact Name *"
        value={contactName}
        onChange={(val) => setContactName(val)}
        placeholder="Full Name"
        error={errors.contactName}
      />

      {/* Contact Number */}
      <TextInput
        label="Contact Number *"
        value={contactNo}
        onChange={(val) => setContactNo(val)}
        placeholder="09171234567"
        error={errors.contactNo}
      />

      {/* Needs */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">What do you need? *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {needOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleNeed(option.value as NeedType)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-sm font-medium ${
                selectedNeeds.includes(option.value as NeedType)
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        {errors.selectedNeeds && <p className="text-xs text-red-600">{errors.selectedNeeds}</p>}
      </div>

      {/* Number of People & Urgency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Number of People *"
          type="number"
          value={numberOfPeople.toString()}
          onChange={(val) => setNumberOfPeople(Number(val))}
          error={errors.numberOfPeople}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Urgency Level *</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["low", "medium", "high", "critical"] as const).map((level) => {
              const colorMap = {
                low: "bg-green-50 border-green-500 text-green-700",
                medium: "bg-yellow-50 border-yellow-500 text-yellow-700",
                high: "bg-orange-50 border-orange-500 text-orange-700",
                critical: "bg-red-50 border-red-500 text-red-700",
              };
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgencyLevel(level)}
                  className={`px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                    urgencyLevel === level
                      ? colorMap[level]
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              );
            })}
          </div>
          {errors.urgencyLevel && <p className="text-xs text-red-600">{errors.urgencyLevel}</p>}
        </div>
      </div>

      {/* Verification Document */}
      <FileInput
        label="Verification Document *"
        file={emergencyDocument}
        onChange={setEmergencyDocument}
        error={errors.emergencyDocument}
      />

      {/* Additional Notes */}
      <TextArea
        label="Additional Notes (Optional)"
        value={additionalNotes}
        onChange={(val) => setAdditionalNotes(val)}
        placeholder="Special needs, medical conditions, etc."
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button onClick={handleSubmit} className="w-full py-3 text-sm font-semibold">
        Submit Request
      </Button>
    </div>
  );
};
