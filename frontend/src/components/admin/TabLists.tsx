// TabLists.tsx
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

export type TabType = "emergencies" | "respondents";

interface TabListsProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
}

export const TabLists: React.FC<TabListsProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };

  return (
    <div className="p-2 bg-gray-50 border-b border-gray-200">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="bg-white border border-gray-200 rounded-lg p-4 gap-4 w-full max-w-lg">
          <TabsTrigger 
            value="emergencies"
            className="flex-1 px-7 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md"
          >
            Emergency Requests for Verification
          </TabsTrigger>
          
          <TabsTrigger 
            value="respondents"
            className="flex-1 px-7 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md"
          >
            Respondents for Verification
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};