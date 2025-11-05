// Dashboard.tsx
import React, { useState } from "react";
import { Header } from "../../components/admin/Header";
import { TabLists, type TabType } from "../../components/admin/TabLists";
import { DataTable } from "../../components/admin/Table";
import { getRespondentColumns } from "./columns/RespondentColumns";
import { getEmergencyColumns } from "./columns/EmergencyColumns";
import type { IUser, IEmergency } from "../../hooks/queries/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import {
  useFetchEmergencies,
  useFetchResponders,
} from "../../hooks/queries/useAdmin";
import { Card, CardContent } from "../../components/ui/card";
import { Users, AlertTriangle, RefreshCw, Shield } from "lucide-react";

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

  // Calculate stats
  const totalResponders = responderData?.data?.length || 0;
  const verifiedResponders = responderData?.data?.filter(r => r.isVerified)?.length || 0;
  const totalEmergencies = emergencyData?.data?.length || 0;
  const pendingEmergencies = emergencyData?.data?.filter(e => !e.isVerified)?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header logout={logout} />
      
      {/* Stats Overview */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Emergencies</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalEmergencies}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100/50">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-amber-500 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{pendingEmergencies}</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100/50">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-green-500 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Respondents</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalResponders}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100/50">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified Respondents</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{verifiedResponders}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100/50">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-0">
            <TabLists activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="p-6">

              {(activeTab === "respondents" ? (
                isLoadingResponders ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                    <p className="text-lg font-medium">Loading respondents...</p>
                    <p className="text-sm mt-1">Please wait while we fetch the data</p>
                  </div>
                ) : isErrorResponders ? (
                  <div className="flex flex-col items-center justify-center py-12 text-destructive">
                    <AlertTriangle className="w-8 h-8 mb-3" />
                    <p className="text-lg font-medium">Failed to load respondents</p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      Please check your connection and try again
                    </p>
                  </div>
                ) : (
                  <DataTable<IUser>
                    title="Respondent Management"
                    description="Manage and verify emergency response volunteers"
                    columns={getRespondentColumns({
                      modalRow: modalResponder,
                      setModalRow: setModalResponder,
                      handleToggleVerify: handleToggleResponderVerify,
                    })}
                    data={responderData?.data || []}
                    searchPlaceholder="Search by name, email, or contact..."
                    filterKeys={["isVerified"]}
                    filterOptions={{
                      isVerified: [
                        { label: "Unveried", value: "unverified" },
                        { label: "Verified", value: "verified" },
                      ],
                    }}
                  />
                )
              ) : isLoadingEmergencies ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-lg font-medium">Loading emergencies...</p>
                  <p className="text-sm mt-1">Please wait while we fetch the data</p>
                </div>
              ) : isErrorEmergencies ? (
                <div className="flex flex-col items-center justify-center py-12 text-destructive">
                  <AlertTriangle className="w-8 h-8 mb-3" />
                  <p className="text-lg font-medium">Failed to load emergencies</p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Please check your connection and try again
                  </p>
                  </div>
                ) : (
                  <DataTable<IEmergency>
                    title="Emergency Management"
                    description="Monitor and verify emergency requests"
                    columns={getEmergencyColumns({
                      modalRow: modalEmergency,
                      setModalRow: setModalEmergency,
                      handleToggleVerify: handleToggleEmergencyVerify,
                    })}
                    data={emergencyData?.data || []}
                    searchPlaceholder="Search by location, needs, or status..."
                    filterKeys={["status", "isVerified"]}
                    filterOptions={{
                      status: [
                        { label: "All", value: "all" },
                        { label: "Pending", value: "pending" },
                        { label: "In Progress", value: "in-progress" },
                        { label: "Resolved", value: "resolved" },
                      ],
                      isVerified: [
                        { label: "Unveried", value: "unverified" },
                        { label: "Verified", value: "verified" },
                      ],
                    }}
                  />
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;