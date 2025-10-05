// App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Emergency from "./screen/Emergency";
import Dashboard from "./screen/admin/Dashboard";
import Unauthorized from "./screen/Unauthorized";
import {
  AdminRoute,
  // RespondentRoute,
  // RolePrivateRoute,
} from "./components/auth/RolePrivateRoute";
import TestAdmin from "./screen/admin/TestAdmin";

export const App = () => {
  return (
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

      {/* Add more admin routes here */}
      {/* <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      /> */}

      {/* Respondent-only routes */}
      {/* <Route
        path="/respondent/dashboard"
        element={
          <RespondentRoute>
            <RespondentDashboard />
          </RespondentRoute>
        }
      />
      
      <Route
        path="/respondent/survey/:id"
        element={
          <RespondentRoute>
            <SurveyPage />
          </RespondentRoute>
        }
      /> */}

      {/* Routes accessible by both admin and respondent */}
      {/* <Route
        path="/profile"
        element={
          <RolePrivateRoute allowedRoles={['admin', 'respondent']}>
            <Profile />
          </RolePrivateRoute>
        }
      /> */}

      {/* Catch all - redirect to unauthorized */}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
};
