import React, { useState } from "react";
import type { IUser } from "../../hooks/queries/useAdmin";
import { API_URL } from "../../constants";
import api from "../../services/authService";

interface VerifyRespondentModalProps {
  respondent: IUser;
  onClose: () => void;
  onSuccess?: () => void;
}

const VerifyRespondentModal: React.FC<VerifyRespondentModalProps> = ({
  respondent,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(`${API_URL}/admin/responders/${respondent._id}/approve`, {});
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to approve respondent:", err);
      alert("Failed to approve respondent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-lg font-semibold mb-4">Verify Respondent</h3>
        <p className="mb-2"><strong>Full Name:</strong> {respondent.fullName}</p>
        <p className="mb-2"><strong>Email:</strong> {respondent.email}</p>
        <p className="mb-2"><strong>Contact No:</strong> {respondent.contactNo}</p>
        <p className="mb-4"><strong>Notes:</strong> {respondent.notes}</p>

        {respondent.verificationDocument && (
          <div className="mb-4">
            <strong>Verification Document:</strong>
            <img
              src={`${API_URL}/uploads/${respondent.verificationDocument}`}
              alt="Verification Document"
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

export default VerifyRespondentModal;
