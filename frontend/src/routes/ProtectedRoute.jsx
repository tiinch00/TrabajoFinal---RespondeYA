import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
    const authed = !!localStorage.getItem("token"); 
    const location = useLocation();
    return authed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
