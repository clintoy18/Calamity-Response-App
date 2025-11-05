import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// App.tsx
import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import Emergency from "./screen/Emergency";
import Dashboard from "./screen/admin/Dashboard";
import Unauthorized from "./screen/Unauthorized";
import { AdminRoute } from "./components/auth/RolePrivateRoute";
import TestAdmin from "./screen/admin/TestAdmin";
export const App = () => {
    useEffect(() => {
        // Register service worker with error handling
        if ("serviceWorker" in navigator) {
            // Wait for page load to avoid blocking
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js", { scope: "/" })
                    .then((registration) => {
                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute
                })
                    .catch((err) => {
                    console.warn("Service Worker registration failed:", err);
                });
            });
        }
    }, []);
    return (
    // 🌀 Suspense wrapper shows loader while components are loading
    _jsx(Suspense, { fallback: _jsx("div", { className: "flex items-center justify-center h-screen bg-gray-50", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx(Loader, { className: "animate-spin text-blue-500", size: 32 }), _jsx("p", { className: "text-gray-600 font-medium", children: "Loading..." })] }) }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Emergency, {}) }), _jsx(Route, { path: "/unauthorized", element: _jsx(Unauthorized, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/test-admin", element: _jsx(AdminRoute, { children: _jsx(TestAdmin, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/unauthorized", replace: true }) })] }) }));
};
