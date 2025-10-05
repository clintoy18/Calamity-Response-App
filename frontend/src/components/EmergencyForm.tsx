import React from "react";
import { FileText, MapPin, X } from "lucide-react";
import type { Location, NeedType } from "../types";
import { needOptions } from "../constants";

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
  errorMessage: string;
  onSubmit: () => void;
  onClose: () => void;
  emergencyDocument: File | null;
  setEmergencyDocument: (file: File | null) => void;
}

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
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!contactNo.trim()) {
      newErrors.contactNo = "Contact number is required.";
    } else if (!/^09\d{9}$/.test(contactNo)) {
      newErrors.contactNo = "Contact number must be a valid Philippine mobile number.";
    }

    if (selectedNeeds.length === 0) {
      newErrors.selectedNeeds = "Please select at least one need.";
    }

    if (!numberOfPeople || numberOfPeople < 1) {
      newErrors.numberOfPeople = "Number of people must be at least 1.";
    }

    if (!urgencyLevel) {
      newErrors.urgencyLevel = "Please select urgency level.";
    }

    if (!emergencyDocument) {
      newErrors.emergencyDocument = "Verification document is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Request Relief</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Location */}
      <div className="mb-5 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>
            {placeName || "Fetching location name..."}
            <br />
            ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
          </span>
        </div>
      </div>

      {/* Needs */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What do you need? *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {needOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleNeed(option.value as NeedType)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                selectedNeeds.includes(option.value as NeedType)
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {option.icon}
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {errors.selectedNeeds && <p className="mt-1 text-xs text-red-600">{errors.selectedNeeds}</p>}
      </div>

      {/* Number of People */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of People *
        </label>
        <input
          type="number"
          min={1}
          max={1000}
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        {errors.numberOfPeople && <p className="mt-1 text-xs text-red-600">{errors.numberOfPeople}</p>}
      </div>

      {/* Urgency */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Urgency Level *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["low", "medium", "high", "critical"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setUrgencyLevel(level)}
              className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all ${
                urgencyLevel === level
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        {errors.urgencyLevel && <p className="mt-1 text-xs text-red-600">{errors.urgencyLevel}</p>}
      </div>

      {/* Contact No */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact No <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          value={contactNo}
          onChange={(e) => setContactNo(e.target.value)}
          placeholder="e.g., 09171234567"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        />
        {errors.contactNo && <p className="mt-1 text-xs text-red-600">{errors.contactNo}</p>}
      </div>

      {/* Additional Notes */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Special needs, medical conditions, number of children, etc."
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
        />
      </div>

      {/* Verification Document */}
      <div className="mb-7">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verification Document <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-300 rounded-lg p-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setEmergencyDocument(e.target.files?.[0] || null)}
            className="text-sm text-gray-700 w-full"
          />
        </div>
        {emergencyDocument && (
          <p className="mt-1 text-xs text-gray-500 truncate">Selected: {emergencyDocument.name}</p>
        )}
        {errors.emergencyDocument && <p className="mt-1 text-xs text-red-600">{errors.emergencyDocument}</p>}
      </div>

      {/* Global Error */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
      >
        Submit Request
      </button>
    </div>
  );
};
