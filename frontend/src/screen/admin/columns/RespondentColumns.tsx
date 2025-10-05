import { type ColumnDef } from "@tanstack/react-table";
import type { IUser } from "../../../hooks/queries/useAdmin";
import VerifyRespondentModal from "../../../components/modal/ViewRespondentModal";

interface RespondentColumnsProps {
  modalRow: IUser | null;
  setModalRow: (row: IUser | null) => void;
  handleToggleVerify: (row: IUser) => void;
}

export const getRespondentColumns = ({
  modalRow,
  setModalRow,
  handleToggleVerify,
}: RespondentColumnsProps): ColumnDef<IUser>[] => [
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contactNo",
    header: "Contact No",
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    cell: ({ getValue }) => {
      const isVerified = getValue() as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isVerified ? "Verified" : "Pending"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const respondent = row.original;

      return (
        <>
          {!respondent.isVerified && (
            <button
              onClick={() => setModalRow(respondent)}
              className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Approve
            </button>
          )}

          {modalRow?._id === respondent._id && (
            <VerifyRespondentModal
              respondent={modalRow}
              onClose={() => setModalRow(null)}
              onConfirm={() => {
                handleToggleVerify(respondent);
                setModalRow(null);
              }}
            />
          )}
        </>
      );
    },
  },
];
