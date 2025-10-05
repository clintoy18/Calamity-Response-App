import React from "react";

interface TabListsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabLists: React.FC<TabListsProps> = ({ activeTab, setActiveTab }) => {

    console.log(activeTab)
  return (
    <div className="px-6 py-4">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "requests"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Request for Verification
          </button>

          <button
            onClick={() => setActiveTab("respondents")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "respondents"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Respondent for Verification
          </button>
        </div>
      </div>
    </div>
  );
};
