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
import Evaluations from "@/pages/evaluations/Evaluations";
import PostProcessing from "@/pages/postProcessing/PostProcessing";
import Integration from "@/pages/integration/Integration";
import Configuration from "@/pages/configuration/Configuration";
import UsersAccounts from "@/pages/usersAccounts/UsersAccounts";

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
 *   - /applications/evaluations - Evaluations dashboard
 *   - /applications/post-processing - Post Processing dashboard
 *   - /administration/integration - Integration management
 *   - /administration/configuration - Configuration settings
 *   - /administration/users-accounts - Users & Accounts management
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
          {/* Applications */}
          <Route element={<Evaluations />} path="applications/evaluations" />
          <Route element={<PostProcessing />} path="applications/post-processing" />
          {/* Administration */}
          <Route element={<Integration />} path="administration/integration" />
          <Route element={<Configuration />} path="administration/configuration" />
          <Route element={<UsersAccounts />} path="administration/users-accounts" />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
