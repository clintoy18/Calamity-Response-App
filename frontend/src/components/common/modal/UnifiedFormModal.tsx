import React, { useState, useEffect } from "react";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { EmergencyForm } from "../../EmergencyForm";
import { ResponderForm } from "../../ResponderForm";
import { StatusMessage } from "../StatusMessage";
import type { Location, NeedType } from "../../../types";

// ---------- Types ----------
type Status = "idle" | "loading" | "success" | "error" | "form";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
}

interface EmergencyModalContent extends BaseModalProps {
  type: "emergency";
  status: Status;
  location: Location | null;
  placeName: string;
  contactNo: string;
  setContactNo: (value: string) => void;
  selectedNeeds: NeedType[]; // ✅ fixed type
  toggleNeed: (need: NeedType) => void; // ✅ fixed type
  numberOfPeople: number;
  setNumberOfPeople: (value: number) => void;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  setUrgencyLevel: (level: "low" | "medium" | "high" | "critical") => void;
  additionalNotes: string;
  setAdditionalNotes: (value: string) => void;
  emergencyDocument: File | null;
  setEmergencyDocument: (file: File | null) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  setStatus: (status: Status) => void;
}

interface ResponderModalContent extends BaseModalProps {
  type: "responder";
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
  onSubmit: () => Promise<void>;
}

type UnifiedModalProps = EmergencyModalContent | ResponderModalContent;

// ---------- Type Guard ----------
function isStatusMessageState(
  status: Status
): status is "loading" | "success" | "error" {
  return ["loading", "success", "error"].includes(status);
}

// ---------- Framer Motion Variants ----------
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

// ---------- Component ----------
export const UnifiedModal: React.FC<UnifiedModalProps> = (props) => {
  const { isOpen, onClose, errorMessage } = props;
  const [internalStatus, setInternalStatus] = useState<Status>("idle");

  // Sync internal state for emergency
  useEffect(() => {
    if (props.type === "emergency") {
      setInternalStatus(props.status);
    }
  }, [props.type === "emergency" ? props.status : null]);

  // ---------- Handlers ----------
  const handleSubmit = async () => {
    setInternalStatus("loading");
    try {
      await props.onSubmit();
      setInternalStatus("success");
    } catch (err) {
      console.error("Submission error:", err);
      setInternalStatus("error");
    }
  };

  const handleReset = () => {
    setInternalStatus("idle");
    if (props.type === "emergency") props.onReset();
  };

  const handleClose = () => {
    setInternalStatus("idle");
    onClose();
    if (props.type === "emergency") props.setStatus("idle");
  };

  // ---------- Button Configurations ----------
  const getButtons = () => {
    if (internalStatus === "success") {
      return [
        {
          text:
            props.type === "emergency"
              ? "Submit Another Request"
              : "Submit Another",
          onClick: handleReset,
          variant: "primary" as const,
        },
        {
          text: "Close",
          onClick: handleClose,
          variant: "secondary" as const,
        },
      ];
    }

    if (internalStatus === "error") {
      if (props.type === "emergency") {
        const hasLocation = Boolean(props.location);
        return [
          {
            text: hasLocation ? "Try Again" : "Location Required",
            onClick: () => setInternalStatus(hasLocation ? "form" : "idle"),
            variant: hasLocation ? ("primary" as const) : ("disabled" as const),
          },
        ];
      }

      return [
        {
          text: "Try Again",
          onClick: () => setInternalStatus("idle"),
          variant: "primary" as const,
        },
      ];
    }

    return [];
  };

  // ---------- Loading Message ----------
  const getLoadingMessage = () => {
    if (props.type === "emergency") {
      return props.location ? "Submitting request..." : "Locating you...";
    }
    return "Submitting application...";
  };

  // ---------- Content Renderer ----------
  const renderContent = () => {
    // --- Show StatusMessage ---
    if (isStatusMessageState(internalStatus)) {
      return (
        <StatusMessage
          state={internalStatus}
          message={
            internalStatus === "error"
              ? errorMessage
              : internalStatus === "loading"
              ? getLoadingMessage()
              : undefined
          }
          hasLocation={
            props.type === "emergency" ? Boolean(props.location) : undefined
          }
          buttons={getButtons()}
        />
      );
    }

    // --- Emergency Form ---
    if (props.type === "emergency") {
      const {
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
        emergencyDocument,
        setEmergencyDocument,
        onReset,
      } = props;

      if (internalStatus !== "form" && props.status !== "form") return null;

      if (!location) {
        return (
          <StatusMessage
            state="error"
            message="Location is required to submit an emergency request"
            buttons={[
              { text: "Close", onClick: handleClose, variant: "primary" as const },
            ]}
          />
        );
      }

      return (
        <EmergencyForm
          location={location} // ✅ fixed proper Location type usage
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
          onSubmit={handleSubmit}
          onClose={onReset}
          emergencyDocument={emergencyDocument}
          setEmergencyDocument={setEmergencyDocument}
        />
      );
    }

    // --- Responder Form ---
    const {
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
    } = props;

    return (
      <ResponderForm
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        contactNumber={contactNumber}
        setContactNumber={setContactNumber}
        document={document}
        setDocument={setDocument}
        notes={notes}
        setNotes={setNotes}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    );
  };

  // ---------- Render ----------
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="z-50 fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={internalStatus}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
