import { Navigate, Outlet } from "react-router";
import { ACCESS_TOKEN } from "../constants";

function ProtectedRoute() {
    const token = localStorage.getItem(ACCESS_TOKEN);
    return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
