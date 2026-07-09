import React, { useState } from "react";
import { AlertTriangle, CloudFog, MapPin, ShieldAlert, X } from "lucide-react";
import type {
  AshfallLevel,
  AshfallReportPayload,
  AshfallVisibility,
  Location,
} from "../../types";
import { TextArea, TextInput } from "../form";
import { Button } from "../form/Button";

const ashLevels: Array<{ value: AshfallLevel; label: string; description: string }> = [
  { value: "LIGHT", label: "Light", description: "Thin dusting or haze" },
  { value: "MODERATE", label: "Moderate", description: "Visible ash on surfaces" },
  { value: "HEAVY", label: "Heavy", description: "Low visibility or thick ash" },
];

const visibilityLevels: Array<{ value: AshfallVisibility; label: string }> = [
  { value: "CLEAR", label: "Clear" },
  { value: "HAZY", label: "Hazy" },
  { value: "LOW", label: "Low" },
  { value: "DANGEROUS", label: "Dangerous" },
];

const needOptions = [
  "Masks",
  "Water",
  "Medicine",
  "Cleanup help",
  "Eye protection",
  "Shelter",
];

interface AshfallReportModalProps {
  isOpen: boolean;
  location: Location | null;
  placeName: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (payload: AshfallReportPayload) => Promise<void>;
}

export const AshfallReportModal: React.FC<AshfallReportModalProps> = ({
  isOpen,
  location,
  placeName,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}) => {
  const [ashLevel, setAshLevel] = useState<AshfallLevel>("LIGHT");
  const [visibility, setVisibility] = useState<AshfallVisibility>("HAZY");
  const [sulfurSmell, setSulfurSmell] = useState(false);
  const [needs, setNeeds] = useState<string[]>([]);
  const [reporterName, setReporterName] = useState("");
  const [contactno, setContactno] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [localError, setLocalError] = useState("");

  if (!isOpen) return null;

  const toggleNeed = (need: string) => {
    setNeeds((current) =>
      current.includes(need)
        ? current.filter((item) => item !== need)
        : [...current, need]
    );
  };

  const handleSubmit = async () => {
    if (!location) {
      setLocalError("Location is required before submitting an ashfall report.");
      return;
    }

    setLocalError("");
    await onSubmit({
      latitude: location.latitude,
      longitude: location.longitude,
      placename: placeName || "Unknown location",
      accuracy: location.accuracy,
      ashLevel,
      visibility,
      sulfurSmell,
      needs,
      reporterName,
      contactno,
      additionalNotes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ashfall-report-title"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-strong border border-gray-200">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <CloudFog className="h-5 w-5" />
            </div>
            <div>
              <h2 id="ashfall-report-title" className="text-lg font-semibold text-gray-950">
                Report Ashfall
              </h2>
              <p className="text-sm text-gray-600">
                Community reports are reviewed before being marked verified.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            aria-label="Close ashfall report"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-700" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {placeName || "Fetching location..."}
                </p>
                {location && (
                  <p className="mt-1 text-xs text-gray-600">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ShieldAlert className="h-4 w-4 text-gray-700" />
              Ash level
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {ashLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setAshLevel(level.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    ashLevel === level.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
                  }`}
                >
                  <span className="block text-sm font-semibold">{level.label}</span>
                  <span
                    className={`mt-1 block text-xs ${
                      ashLevel === level.value ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    {level.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Visibility</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {visibilityLevels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setVisibility(item.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    visibility === item.value
                      ? "border-amber-600 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={sulfurSmell}
              onChange={(event) => setSulfurSmell(event.target.checked)}
              className="h-4 w-4 accent-gray-900"
            />
            Sulfur smell is noticeable
          </label>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">Needed supplies or help</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {needOptions.map((need) => (
                <button
                  key={need}
                  type="button"
                  onClick={() => toggleNeed(need)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    needs.includes(need)
                      ? "border-blue-700 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {need}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Reporter name"
              value={reporterName}
              onChange={setReporterName}
              placeholder="Optional"
            />
            <TextInput
              label="Contact number"
              value={contactno}
              onChange={setContactno}
              placeholder="Optional"
            />
          </div>

          <TextArea
            label="Notes"
            value={additionalNotes}
            onChange={setAdditionalNotes}
            placeholder="Describe affected streets, health concerns, or urgent needs."
            rows={4}
          />

          {(localError || errorMessage) && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{localError || errorMessage}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            Cancel
          </button>
          <div className="sm:w-44">
            <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
              Submit Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
