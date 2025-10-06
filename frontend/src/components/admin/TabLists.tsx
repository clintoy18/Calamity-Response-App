// TabLists.tsx
import React from "react";

export type TabType = "emergencies" | "respondents";

interface TabListsProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
}

export const TabLists: React.FC<TabListsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="px-6 py-4">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex border-b border-gray-200">
          {["emergencies", "respondents"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "emergencies"
                ? "Emergency Requests for Verification"
                : "Respondents for Verification"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};