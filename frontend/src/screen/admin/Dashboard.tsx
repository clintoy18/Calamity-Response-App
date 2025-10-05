import React, { useMemo, useState } from "react";
import { Header } from "../../components/admin/Header";
import { TabLists } from "../../components/admin/TabLists";
import { DataTable } from "../../components/admin/Table";
import { useRespondents } from "../../hooks/queries/useRespondents";
import { respondentColumns } from "./columns/RespondentColumns";
import { useAuth } from "../../hooks/useAuth";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"respondents">("respondents");

  const { respondents, handleToggleVerify, isLoading } = useRespondents(activeTab);
  const { logout } = useAuth()


  // Debug: Check the data structure
  console.log("Respondents data:", respondents);
  console.log("First respondent:", respondents?.[0]);

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(
    () => respondentColumns(handleToggleVerify),
    [handleToggleVerify]
  );
  
  const handleAdd = () => {
    alert("Add new respondent");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header logout={logout}  />
      <TabLists activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold mb-3 capitalize">Respondents</h2>

        {isLoading ? (
          <p className="text-center py-4">Loading data...</p>
        ) : respondents && respondents.length > 0 ? (
          <DataTable data={respondents} columns={columns} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No respondents found
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;