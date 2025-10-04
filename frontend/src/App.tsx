import { Routes, Route } from "react-router-dom";
import Emergency from "./screen/Emergency";
import Dashboard from "./screen/admin/Dashboard";
import { PrivateRoute } from "./components/auth/PrivateRoute";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Emergency />} />
      {/* must be protected route */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};
