/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Route, Routes } from "react-router";
import { HostedRoute } from "../components/HostedRoute";
import { PrivateRoute } from "../components/PrivateRoute";
import { PublicRoute } from "../components/PublicRoute";
import { ForgotPassword } from "../pages/authentication/ForgotPassword";
import { Login } from "../pages/authentication/Login";
import { Logout } from "../pages/authentication/Logout";
import { Register } from "../pages/authentication/Register";
import { Dashboard } from "../pages/Dashboard";
import { Index } from "../pages/Index";
import { Projects } from "../pages/Projects";

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/" element={<PublicRoute />}>
      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="" element={<HostedRoute />}>
        <Route path="register" element={<Register />} />
      </Route>
    </Route>
    <Route path="/app" element={<PrivateRoute />}>
      <Route path="logout" element={<Logout />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="projects" element={<Projects />} />
    </Route>
  </Routes>
);
