// ResponderModal.tsx
import React from "react";
import { ResponderForm } from "./ResponderForm";

interface ResponderModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
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

export const ResponderModal: React.FC<ResponderModalProps> = ({
  isOpen,
  setIsOpen,
  onClose,
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
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
          onSubmit={onSubmit}
          onClose={() => {
            setIsOpen(false);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
