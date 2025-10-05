import { type ColumnDef } from '@tanstack/react-table';
import type { IEmergency } from '../../../hooks/queries/useAdmin';
import { VerifyEmergencyModal } from '../../../components/modal/ViewEmergencyModal';

interface EmergencyColumnsProps {
  modalRow: IEmergency | null;
  setModalRow: (row: IEmergency | null) => void;
  handleToggleVerify: (row: IEmergency) => void;
}

export const getEmergencyColumns = ({
  modalRow,
  setModalRow,
  handleToggleVerify,
}: EmergencyColumnsProps): ColumnDef<IEmergency>[] => [
  {
    accessorKey: 'placename',
    header: 'Place',
  },
  {
    accessorKey: 'contactno',
    header: 'Contact No',
  },
  {
    accessorKey: 'needs',
    header: 'Needs',
    cell: ({ getValue }) => (getValue() as string[]).join(', '),
  },
  {
    accessorKey: 'numberOfPeople',
    header: 'No. of People',
  },
  {
    accessorKey: 'urgencyLevel',
    header: 'Urgency',
    cell: ({ getValue }) => {
      const level = getValue() as IEmergency['urgencyLevel'];
      const colors = {
        LOW: 'bg-green-100 text-green-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HIGH: 'bg-orange-100 text-orange-800',
        CRITICAL: 'bg-red-100 text-red-800',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[level]}`}>
          {level}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as IEmergency['status'];
      const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const emergency = row.original;

      return (
        <>
          {!emergency.isVerified && (
            <button
              onClick={() => setModalRow(emergency)}
              className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Verify
            </button>
          )}

          {modalRow?.id === emergency.id && (
            <VerifyEmergencyModal
              emergency={modalRow}
              onClose={() => setModalRow(null)}
              onConfirm={() => {
                handleToggleVerify(emergency);
                setModalRow(null);
              }}
            />
          )}
        </>
      );
    },
  },
];
