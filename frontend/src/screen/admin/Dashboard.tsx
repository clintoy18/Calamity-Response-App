// Dashboard.tsx
import React, { useState } from "react";
import { Header } from "../../components/admin/Header";
import { TabLists, type TabType } from "../../components/admin/TabLists";
import { DataTable, type FilterOption } from "../../components/admin/Table";
import { getRespondentColumns } from "./columns/RespondentColumns";
import { getEmergencyColumns } from "./columns/EmergencyColumns";
import type { IUser, IEmergency } from "../../hooks/queries/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import {
  useFetchEmergencies,
  useFetchResponders,
} from "../../hooks/queries/useAdmin";

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("emergencies");
  const [modalResponder, setModalResponder] = useState<IUser | null>(null);
  const [modalEmergency, setModalEmergency] = useState<IEmergency | null>(null);

  // Fetch ALL data without pagination - using a very large limit
  const {
    data: responderData,
    isLoading: isLoadingResponders,
    isError: isErrorResponders,
    refetch: refetchResponders,
  } = useFetchResponders(1, 99999);

  const {
    data: emergencyData,
    isLoading: isLoadingEmergencies,
    isError: isErrorEmergencies,
    refetch: refetchEmergencies,
  } = useFetchEmergencies(1, 99999);

  // Verification handlers
  const handleToggleResponderVerify = (row: IUser) => {
    console.log("Toggle responder verification:", row);
    refetchResponders();
  };

  const handleToggleEmergencyVerify = (row: IEmergency) => {
    console.log("Toggle emergency verification:", row);
    refetchEmergencies();
  };

  // Filter options
  const responderFilters: FilterOption[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
  ];

  const emergencyFilters: FilterOption[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Resolved", value: "resolved" },
    { label: "Verified", value: "verified" },
  ];

  // Render DataTable depending on the active tab
  return (
    <div className="min-h-screen bg-gray-100">
      <Header logout={logout} />
      <TabLists activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="px-6 py-4">
        {activeTab === "respondents" ? (
          isLoadingResponders ? (
            <div className="text-center py-10">Loading responders...</div>
          ) : isErrorResponders ? (
            <div className="text-center py-10 text-red-500">
              Failed to load responders. Please try again.
            </div>
          ) : (
            <DataTable<IUser>
              columns={getRespondentColumns({
                modalRow: modalResponder,
                setModalRow: setModalResponder,
                handleToggleVerify: handleToggleResponderVerify,
              })}
              data={responderData?.data || []}
              searchPlaceholder="Search by name, email, or contact..."
              filterKey="isVerified"
              filterOptions={responderFilters}
            />
          )
        ) : isLoadingEmergencies ? (
          <div className="text-center py-10">Loading emergencies...</div>
        ) : isErrorEmergencies ? (
          <div className="text-center py-10 text-red-500">
            Failed to load emergencies. Please try again.
          </div>
        ) : (
          <DataTable<IEmergency>
            columns={getEmergencyColumns({
              modalRow: modalEmergency,
              setModalRow: setModalEmergency,
              handleToggleVerify: handleToggleEmergencyVerify,
            })}
            data={emergencyData?.data || []}
            searchPlaceholder="Search by location, needs, or status..."
            filterKey="isVerified"
            filterOptions={emergencyFilters}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
