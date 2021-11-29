/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from "react";
import { Route, Routes } from "react-router";
import { HostedRoute } from "../components/HostedRoute";
import { PrivateRoute } from "../components/PrivateRoute";
import { PublicRoute } from "../components/PublicRoute";
import { RecoverPassword } from "../pages/authentication/RecoverPassword";
import { Login } from "../pages/authentication/Login";
import { Logout } from "../pages/authentication/Logout";
import { Register } from "../pages/authentication/Register";
import { Index } from "../pages/Index";
import { Products } from "../pages/products/Products";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Create as ProductCreate } from "../pages/products/Create";
import { Edit as ProductEdit } from "../pages/products/Edit";
import { Clone as ProductClone } from "../pages/products/Clone";
import { Invoices } from "../pages/invoices/Invoices";

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/recover_password" element={<RecoverPassword />} />
      <Route element={<HostedRoute />}>
        <Route path="/register" element={<Register />} />
      </Route>
    </Route>
    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products">
        <Route path="" element={<Products />} />
        <Route path="create" element={<ProductCreate />} />
        <Route path=":id/edit" element={<ProductEdit />} />
        <Route path=":id/clone" element={<ProductClone />} />
      </Route>
      <Route path="/invoices">
        <Route path="" element={<Invoices />} />
      </Route>
      <Route path="/logout" element={<Logout />} />
    </Route>
  </Routes>
);
