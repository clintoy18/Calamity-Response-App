import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../services/authService";
import { AxiosError } from "axios";
import { getUserRole, type UserRole } from "../../utils/authUtils";

interface RolePrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RolePrivateRoute = ({
  children,
  allowedRoles,
}: RolePrivateRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validate = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check role from token
      const userRole = getUserRole();
      if (!userRole || !allowedRoles.includes(userRole)) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      try {
        await api.get("/auth/validate");
        setIsAuthenticated(true);
        setHasPermission(true);
      } catch (err) {
        const error = err as AxiosError<{ message?: string; code?: string }>;

        // ✅ Handle verification error
        if (
          error.response?.status === 403 &&
          error.response?.data?.code === "ACCOUNT_NOT_VERIFIED"
        ) {
          setVerificationError(true);
          // Clear token since account is not verified
          localStorage.removeItem("token");
        }

        setIsAuthenticated(false);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  }, [navigate, allowedRoles]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // ✅ Show verification error message
  if (verificationError) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Account Pending Verification
          </h2>
          <p className="text-gray-600 mb-6">
            Your account is currently being reviewed by our administrators. You
            will be notified once your account has been approved.
          </p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Convenience component for admin-only routes
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <RolePrivateRoute allowedRoles={["admin"]}>{children}</RolePrivateRoute>
  );
};

// Convenience component for respondent-only routes
export const RespondentRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <RolePrivateRoute allowedRoles={["respondent"]}>
      {children}
    </RolePrivateRoute>
  );
};
