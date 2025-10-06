import React from "react";
import type { Status, Location, NeedType } from "../types";
import { LoadingState } from "./LoadingState";
import { SuccessState } from "./SuccessState";
import { ErrorState } from "./ErrorState";
import { EmergencyForm } from "./EmergencyForm";

interface EmergencyModalProps {
  status: Status;
  location: Location | null;
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
  onReset: () => void;
  setStatus: (status: Status) => void;
  emergencyDocument: File | null;
  setEmergencyDocument: (file: File | null) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  status,
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
  onReset,
  setStatus,
  emergencyDocument,
  setEmergencyDocument,
}) => {
  if (status === "idle") return null;

  const handleRetry = () => {
    if (location) setStatus("form");
    else setStatus("idle");
  };

  return (
    <div className="z-50 fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full sm:max-w-3xl mx-auto rounded-xl shadow-xl max-h-[90vh] overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh] p-4 sm:p-6">
          {status === "loading" && <LoadingState hasLocation={!!location} />}

          {status === "form" && location && (
            <EmergencyForm
              location={location}
              placeName={placeName}
              contactNo={contactNo}
              setContactNo={setContactNo}
              selectedNeeds={selectedNeeds}
              toggleNeed={toggleNeed}
              numberOfPeople={numberOfPeople}
              setNumberOfPeople={setNumberOfPeople}
              urgencyLevel={urgencyLevel}
              setUrgencyLevel={setUrgencyLevel}
              additionalNotes={additionalNotes}
              setAdditionalNotes={setAdditionalNotes}
              errorMessage={errorMessage}
              onSubmit={onSubmit}
              onClose={onReset}
              emergencyDocument={emergencyDocument}
              setEmergencyDocument={setEmergencyDocument}
            />
          )}

          {status === "success" && (
            <SuccessState onReset={onReset} onClose={() => setStatus("idle")} />
          )}

          {status === "error" && (
            <ErrorState
              errorMessage={errorMessage}
              hasLocation={!!location}
              onRetry={handleRetry}
            />
          )}
        </div>
      </div>
    </div>
  );
};
