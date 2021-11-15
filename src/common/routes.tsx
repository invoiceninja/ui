import { Route, Routes } from "react-router";
import { Login } from "../pages/authentication/Login";
import { Index } from "../pages/Index";

export const routes = (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
  </Routes>
);
