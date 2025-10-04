// components/auth/RoleBasedComponent.tsx
import type { ReactNode } from "react";
import { hasAnyRole, type UserRole } from "../../utils/authUtils";

interface RoleBasedComponentProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

// Component that only renders if user has the required role
export const RoleBasedComponent = ({
  children,
  allowedRoles,
  fallback = null,
}: RoleBasedComponentProps) => {
  if (hasAnyRole(...allowedRoles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

// Specific role components
export const AdminOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  return (
    <RoleBasedComponent allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
};

export const RespondentOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  return (
    <RoleBasedComponent allowedRoles={["respondent"]} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
};

// Example usage in a component:
// import { AdminOnly, RespondentOnly } from './components/auth/RoleBasedComponent';
//
// function Navbar() {
//   return (
//     <nav>
//       <AdminOnly>
//         <Link to="/admin">Admin Dashboard</Link>
//       </AdminOnly>
//
//       <RespondentOnly>
//         <Link to="/respondent/dashboard">My Dashboard</Link>
//       </RespondentOnly>
//     </nav>
//   );
// }
