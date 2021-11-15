import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../common/stores/store";

export function PrivateRoute() {
  const authenticated = useSelector(
    (state: RootState) => state.user.authenticated
  );

  return authenticated ? <Outlet /> : <Navigate to="/login" />;
}
