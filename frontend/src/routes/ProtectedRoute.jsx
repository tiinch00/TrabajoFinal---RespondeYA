import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
    const authed = !!localStorage.getItem("token"); // ajustá si usás otro storage/clave
    const location = useLocation();
    return authed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
