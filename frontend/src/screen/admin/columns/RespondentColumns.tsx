import { type ColumnDef } from '@tanstack/react-table';
import React, { useState } from 'react';
import { API_URL } from '../../../constants';

interface Respondent {
  id: string;
  fullName: string;
  email: string;
  contactNo: string;
  isVerified: boolean;
  notes: string;
  verificationDocument?: string;
}

export const respondentColumns = (
  handleToggleVerify: (row: Respondent) => void
): ColumnDef<Respondent>[] => [
  {
    accessorKey: 'fullName',
    header: 'Full Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'contactNo',
    header: 'Contact No',
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
  },
  {
    accessorKey: 'isVerified',
    header: 'Status',
    cell: ({ getValue }) => {
      const isVerified = getValue() as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isVerified
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {isVerified ? 'Verified' : 'Pending'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const respondent = row.original;
      const [isModalOpen, setIsModalOpen] = useState(false);

      if (respondent.isVerified) return null;

      return (
        <>
          {/* Approve Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            Approve
          </button>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Verify Respondent
                </h3>
                
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
                    <img
                      src={`${API_URL}/uploads/${respondent.verificationDocument}`}
                      alt="Verification Document"
                      className="mt-2 max-h-48 w-auto border rounded"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleToggleVerify(respondent);
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    },
  },
];
