import { type ColumnDef } from "@tanstack/react-table";
import type { AshfallStatus } from "../../../types";
import type { IAshfallReport } from "../../../hooks/queries/useAdmin";

interface AshfallColumnsProps {
  handleStatusChange: (row: IAshfallReport, status: AshfallStatus) => void;
}

export const getAshfallColumns = ({
  handleStatusChange,
}: AshfallColumnsProps): ColumnDef<IAshfallReport>[] => [
  {
    accessorKey: "placename",
    header: "Place",
  },
  {
    accessorKey: "ashLevel",
    header: "Ash Level",
    cell: ({ getValue }) => {
      const level = getValue() as IAshfallReport["ashLevel"];
      const colors = {
        LIGHT: "bg-gray-100 text-gray-800",
        MODERATE: "bg-amber-100 text-amber-800",
        HEAVY: "bg-red-100 text-red-800",
      };
      return (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colors[level]}`}>
          {level}
        </span>
      );
    },
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
  },
  {
    accessorKey: "needs",
    header: "Needs",
    cell: ({ getValue }) => {
      const needs = getValue() as string[];
      return needs.length ? needs.join(", ") : "None listed";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as IAshfallReport["status"];
      const colors = {
        unverified: "bg-yellow-100 text-yellow-800",
        verified: "bg-green-100 text-green-800",
        archived: "bg-gray-100 text-gray-700",
      };
      return (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colors[status]}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Reported",
    cell: ({ getValue }) => {
      const createdAt = getValue() as string | undefined;
      return createdAt ? new Date(createdAt).toLocaleString() : "Unknown";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const report = row.original;
      return (
        <div className="flex flex-wrap gap-2">
          {report.status !== "verified" && (
            <button
              type="button"
              onClick={() => handleStatusChange(report, "verified")}
              className="rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-800 transition-colors hover:bg-green-200"
            >
              Verify
            </button>
          )}
          {report.status === "verified" && (
            <button
              type="button"
              onClick={() => handleStatusChange(report, "unverified")}
              className="rounded-md bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-200"
            >
              Unverify
            </button>
          )}
          {report.status !== "archived" && (
            <button
              type="button"
              onClick={() => handleStatusChange(report, "archived")}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200"
            >
              Archive
            </button>
          )}
        </div>
      );
    },
  },
];
