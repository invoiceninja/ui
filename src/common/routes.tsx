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
