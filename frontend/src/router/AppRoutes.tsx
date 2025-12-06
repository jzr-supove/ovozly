/**
 * Application Routes
 *
 * Defines the routing structure for the application including
 * public and protected routes.
 */

import { Navigate, Route, Routes } from "react-router-dom";

import Login from "@/pages/auth/login/Login";
import SignUp from "@/pages/auth/signup/SignUp";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "@/pages/dashboard/Dashboard";
import Calls from "@/pages/calls/Calls";
import Analytics from "@/pages/analytics/Analytics";
import SingleCall from "@/pages/singleCall/SingleCall";

/**
 * Main application router component.
 *
 * Route structure:
 * - /login (public) - Authentication page
 * - /signup (public) - Registration page
 * - / (protected) - Dashboard with nested routes
 *   - /analytics - Analytics dashboard (default)
 *   - /calls - Call list
 *   - /calls/:callId - Single call details
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<Login />} path="/login" />
      <Route element={<SignUp />} path="/signup" />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Dashboard />} path="/">
          <Route index element={<Navigate to="analytics" replace />} />
          <Route element={<Analytics />} path="analytics" />
          <Route element={<Calls />} path="calls" />
          <Route element={<SingleCall />} path="calls/:callId" />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
