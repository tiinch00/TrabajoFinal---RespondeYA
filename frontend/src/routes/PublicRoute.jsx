import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
    const authed = !!localStorage.getItem("token");
    return authed ? <Navigate to="/" replace /> : <Outlet />;
}
