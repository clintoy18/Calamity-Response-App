export type UserRole = "admin" | "respondent";

interface DecodedToken {
  userId: string;
  role: UserRole;
  email: string;
  exp: number;
  iat: number;
}

// Decode JWT token without verification (verification happens on backend)
const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// Get user role from localStorage token
export const getUserRole = (): UserRole | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.role || null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded) return false;

  // Check if token is expired
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

// Check if user has specific role
export const hasRole = (role: UserRole): boolean => {
  const userRole = getUserRole();
  return userRole === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (...roles: UserRole[]): boolean => {
  const userRole = getUserRole();
  return userRole !== null && roles.includes(userRole);
};

// Get user ID from token
export const getUserId = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.userId || null;
};

// Get user email from token
export const getUserEmail = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.email || null;
};

// Get full decoded token
export const getDecodedToken = (): DecodedToken | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return decodeToken(token);
};
