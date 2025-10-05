import React, { useState } from "react";
import { API_URL } from "../../constants";
import type { IEmergency } from "../../hooks/queries/useAdmin";
import api from "../../services/authService";

interface VerifyEmergencyModalProps {
  emergency: IEmergency;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VerifyEmergencyModal: React.FC<VerifyEmergencyModalProps> = ({
  emergency,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(`${API_URL}/admin/emergencies/${emergency._id}/approve`, {});
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to approve emergency:", err);
      alert("Failed to approve emergency.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-lg font-semibold mb-4">Verify Emergency</h3>
        <p><strong>Place:</strong> {emergency.placename}</p>
        <p><strong>Contact:</strong> {emergency.contactno}</p>
        <p><strong>Needs:</strong> {emergency.needs.join(", ")}</p>
        <p><strong>No. of People:</strong> {emergency.numberOfPeople}</p>
        <p><strong>Urgency:</strong> {emergency.urgencyLevel}</p>
        <p><strong>Status:</strong> {emergency.status}</p>

        {emergency.imageVerification && (
          <div className="mb-4">
            <strong>Verification Image:</strong>
            <img
              src={`${API_URL}/uploads/${emergency.imageVerification}`}
              alt="Emergency Verification"
              className="mt-2 max-h-48 w-auto border rounded"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Approving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
