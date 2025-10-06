import React, { useState, useEffect } from "react";
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
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  function extractS3Key(url: string): string {
    const AWS_BASE_URL = import.meta.env.VITE_AWS_BASE_URL;
    return url.startsWith(AWS_BASE_URL) ? url.replace(AWS_BASE_URL, "") : url;
  }

  // Fetch presigned URL when modal mounts
  useEffect(() => {
    const fetchPresignedUrl = async () => {
      if (!respondent.verificationDocument) return;

      try {
        const key = extractS3Key(respondent.verificationDocument); // already store only the S3 key
        const res = await api.get(
          `${API_URL}/files/presign?key=${encodeURIComponent(key)}`
        );
        setImgUrl(res.data.url);
      } catch (err) {
        console.error("Failed to fetch presigned URL:", err);
      }
    };

    fetchPresignedUrl();
  }, [respondent]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(
        `${API_URL}/admin/responders/${respondent._id}/approve`,
        {}
      );
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
        <p className="mb-2">
          <strong>Full Name:</strong> {respondent.fullName}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {respondent.email}
        </p>
        <p className="mb-2">
          <strong>Contact No:</strong> {respondent.contactNo}
        </p>
        <p className="mb-4">
          <strong>Notes:</strong> {respondent.notes}
        </p>

        {respondent.verificationDocument && (
          <div className="mb-4">
            <strong>Verification Document:</strong>
            {imgUrl ? (
              <img
                src={imgUrl}
                alt="Verification Document"
                className="mt-2 max-h-48 w-auto border rounded"
              />
            ) : (
              <p className="mt-2 text-gray-500">Loading document...</p>
            )}
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
