import React, { useState } from "react";
import { API_URL } from "../../constants";
import type { IEmergency } from "../../hooks/queries/useAdmin";
import api from "../../services/authService";

interface VerifyEmergencyModalProps {
  emergency: IEmergency;
  onClose: () => void;
  onSuccess?: () => void;
  onConfirm: () => void;

}

export const VerifyEmergencyModal: React.FC<VerifyEmergencyModalProps> = ({
  emergency,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(`${API_URL}/admin/emergencies/${emergency._id}/approve`, {});
      setSuccessMessage("Emergency verified successfully!");
      onSuccess?.();

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Failed to approve emergency:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to approve emergency.");
    } finally {
      setLoading(false);
    }
  };

  const badgeColor = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
          Verify Emergency Report
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="grid grid-cols-2 gap-y-2">
            <p className="font-medium text-gray-900">Place:</p>
            <p>{emergency.placename}</p>

            <p className="font-medium text-gray-900">Contact:</p>
            <p>{emergency.contactno}</p>

            <p className="font-medium text-gray-900">People Affected:</p>
            <p>{emergency.numberOfPeople}</p>

            <p className="font-medium text-gray-900">Urgency:</p>
            <p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  badgeColor[emergency.urgencyLevel as keyof typeof badgeColor] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {emergency.urgencyLevel}
              </span>
            </p>

            <p className="font-medium text-gray-900">Status:</p>
            <p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  emergency.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : emergency.status === "resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {emergency.status}
              </span>
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-900 mb-1">Needs:</p>
            <div className="flex flex-wrap gap-2">
              {emergency.needs?.map((need, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                >
                  {need}
                </span>
              ))}
            </div>
          </div>

          {emergency.imageVerification && (
            <div className="mt-3">
              <p className="font-medium text-gray-900 mb-1">
                Verification Image:
              </p>
              <div className="max-h-64 overflow-hidden rounded-lg border">
                <img
                  src={`${API_URL}/uploads/${emergency.imageVerification}`}
                  alt="Emergency Verification"
                  className="w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {successMessage && (
          <div className="mt-5 p-3 text-green-700 bg-green-50 border border-green-200 rounded-md text-center font-medium">
            {successMessage}
          </div>
        )}

        {!successMessage && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              {loading ? "Verifying..." : "Confirm Verification"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
