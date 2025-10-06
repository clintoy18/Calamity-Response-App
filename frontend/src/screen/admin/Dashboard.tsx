import React, { useState } from "react";
import { Header } from "../../components/admin/Header";
import { TabLists } from "../../components/admin/TabLists";
import { DataTable, type FilterOption } from "../../components/admin/Table";
import { getRespondentColumns } from "./columns/RespondentColumns";
import { getEmergencyColumns } from "./columns/EmergencyColumns";
import type { IUser, IEmergency } from "../../hooks/queries/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import {
  useFetchEmergencies,
  useFetchResponders,
} from "../../hooks/queries/useAdmin";

type TabType = "respondents" | "emergencies";

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("respondents");
  const [modalResponder, setModalResponder] = useState<IUser | null>(null);
  const [modalEmergency, setModalEmergency] = useState<IEmergency | null>(null);

  // Fetch ALL data without pagination - using a very large limit
  const {
    data: responderData,
    isLoading: isLoadingResponders,
    refetch: refetchResponders,
  } = useFetchResponders(1, 99999);

  const {
    data: emergencyData,
    isLoading: isLoadingEmergencies,
    refetch: refetchEmergencies,
  } = useFetchEmergencies(1, 99999);

  // Verification handlers
  const handleToggleResponderVerify = (row: IUser) => {
    console.log("Toggle responder verification:", row);
    // call API to verify responder
    refetchResponders(); // refresh after verification
  };

  const handleToggleEmergencyVerify = (row: IEmergency) => {
    console.log("Toggle emergency verification:", row);
    // call API to verify emergency
    refetchEmergencies(); // refresh after verification
  };

  // Filter options for respondents
  const responderFilters: FilterOption[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
  ];

  // Filter options for emergencies
  const emergencyFilters: FilterOption[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Resolved", value: "resolved" },
    { label: "Verified", value: "verified" },
  ];

  // Urgency level filters
  // const urgencyFilters: FilterOption[] = [
  //   { label: "All", value: "all" },
  //   { label: "Critical", value: "CRITICAL" },
  //   { label: "High", value: "HIGH" },
  //   { label: "Medium", value: "MEDIUM" },
  //   { label: "Low", value: "LOW" },
  // ];

  // Determine table data and columns based on active tab
  const tableProps =
    activeTab === "respondents"
      ? {
          data: responderData?.data || [],
          columns: getRespondentColumns({
            modalRow: modalResponder,
            setModalRow: setModalResponder,
            handleToggleVerify: handleToggleResponderVerify,
          }),
          isLoading: isLoadingResponders,
          searchPlaceholder: "Search by name, email, or contact...",
          filterKey: "isVerified" as keyof IUser,
          filterOptions: responderFilters,
        }
      : {
          data: emergencyData?.data || [],
          columns: getEmergencyColumns({
            modalRow: modalEmergency,
            setModalRow: setModalEmergency,
            handleToggleVerify: handleToggleEmergencyVerify,
          }),
          isLoading: isLoadingEmergencies,
          searchPlaceholder: "Search by location, needs, or status...",
          filterKey: "isVerified" as keyof IEmergency,
          filterOptions: emergencyFilters,
        };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header logout={logout} />
      <TabLists activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="px-6 py-4">
        {tableProps.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-600 font-medium">
                Loading data...
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={tableProps.columns}
            data={tableProps.data}
            searchPlaceholder={tableProps.searchPlaceholder}
            filterKey={tableProps.filterKey}
            filterOptions={tableProps.filterOptions}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
