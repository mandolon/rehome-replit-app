
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

// This assumes UserContext exposes isImpersonating and currentUser
const CLIENT_DASHBOARD_ROUTE = "/client/dashboard";

const ImpersonationGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let userContext;
  try {
    userContext = useUser() as any;
  } catch (e) {
    // Log detailed error and render fallback UI
    console.error("[ImpersonationGate] useUser() failed: Make sure ImpersonationGate is rendered inside <UserProvider>.", e);
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 bg-red-50">
        <div>
          <strong>Critical error:</strong> UserProvider context is missing.<br />
          The application may be misconfigured. Please ensure that <code>&lt;UserProvider&gt;</code> is applied at the root of your app.
        </div>
      </div>
    );
  }
  const { currentUser, isImpersonating, impersonatedUser } = userContext;
  const location = useLocation();
  const navigate = useNavigate();

  // Only lock when impersonating as a client
  useEffect(() => {
    if (
      isImpersonating &&
      impersonatedUser &&
      impersonatedUser.role === "Client" &&
      location.pathname !== CLIENT_DASHBOARD_ROUTE
    ) {
      navigate(CLIENT_DASHBOARD_ROUTE, { replace: true });
    }
  }, [isImpersonating, impersonatedUser, location.pathname, navigate]);

  // If impersonating as client, only allow client dashboard
  if (
    isImpersonating &&
    impersonatedUser &&
    impersonatedUser.role === "Client" &&
    location.pathname !== CLIENT_DASHBOARD_ROUTE
  ) {
    return null; // blank while redirecting
  }
  return <>{children}</>;
};

export default ImpersonationGate;

