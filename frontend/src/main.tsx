import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { App } from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";

// Create a QueryClient instance (can be customized with options)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // auto retry failed requests
      refetchOnWindowFocus: false, // prevent refetching when switching tabs
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
