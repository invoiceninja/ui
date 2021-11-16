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
import { PrivateRoute } from "../components/PrivateRoute";
import { PublicRoute } from "../components/PublicRoute";
import { Login } from "../pages/authentication/Login";
import { Logout } from "../pages/authentication/Logout";
import { Dashboard } from "../pages/Dashboard";
import { Index } from "../pages/Index";

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/" element={<PublicRoute />}>
      <Route path="login" element={<Login />} />
    </Route>
    <Route path="/app" element={<PrivateRoute />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="logout" element={<Logout />} />
    </Route>
  </Routes>
);
