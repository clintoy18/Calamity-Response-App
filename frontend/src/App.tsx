// App.tsx
import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import Emergency from "./screen/Emergency";
import Dashboard from "./screen/admin/Dashboard";
import Unauthorized from "./screen/Unauthorized";
import { AdminRoute } from "./components/auth/RolePrivateRoute";
import TestAdmin from "./screen/admin/TestAdmin";

export const App = () => {
  return (
    // 🌀 Suspense wrapper shows loader while components are loading
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <Loader className="animate-spin text-blue-500" size={32} />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Emergency />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/test-admin"
          element={
            <AdminRoute>
              <TestAdmin />
            </AdminRoute>
          }
        />

        {/* Catch all - redirect to unauthorized */}
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    </Suspense>
  );
};
