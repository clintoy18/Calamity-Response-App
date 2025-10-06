import React from 'react';

interface StatsProps {
  stats: {
    totalResponders: number;
    verifiedResponders: number;
    pendingRequests: number;
    completedRequests: number;
  };
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-4 px-6 py-4">
      {/* Total Responders */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Total Responders</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">
          {stats.totalResponders}
        </p>
      </div>

      {/* Verified Responders */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Verified Responders</p>
        <p className="text-2xl font-semibold text-blue-600 mt-1">
          {stats.verifiedResponders}
        </p>
      </div>

      {/* Pending Requests */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
        <p className="text-2xl font-semibold text-yellow-600 mt-1">
          {stats.pendingRequests}
        </p>
      </div>

      {/* Completed Requests */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Completed Requests</p>
        <p className="text-2xl font-semibold text-green-600 mt-1">
          {stats.completedRequests}
        </p>
      </div>
    </div>
  );
};
