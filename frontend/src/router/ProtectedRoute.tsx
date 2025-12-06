/**
 * Protected Route Component
 *
 * Guards routes that require authentication.
 * Redirects unauthenticated users to the login page.
 */

import type { FC } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/services/api";

const ProtectedRoute: FC = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
