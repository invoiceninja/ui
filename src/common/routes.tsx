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
import { Login } from "../pages/authentication/Login";
import { Index } from "../pages/Index";

export const routes = (
  <Routes>
    <Route path="/" element={<PrivateRoute />}>
      <Route path="/" element={<Index />} />
    </Route>
    <Route path="/login" element={<Login />} />
  </Routes>
);
