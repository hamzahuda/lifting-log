import { Navigate } from "react-router";

export default function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
}
