import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
    const location = useLocation();

    const isAuthRoute = location.pathname.includes("/login") || location.pathname.includes("/register");

    if (!isAuthenticated && !isAuthRoute) {
        return <Navigate to="/auth/login" replace />;
    }

    if (isAuthenticated && isAuthRoute) {
        if (user?.role === "admin") {
            return <Navigate to="/admin/user" replace />;
        } else {
            return <Navigate to="/shop/home" replace />;
        }
    }

    // Prevent non-admin users from accessing admin routes
    if (isAuthenticated && user?.role !== "admin" && location.pathname.includes("/admin")) {
        return <Navigate to="/unauth-page" replace />;
    }

    // Prevent admin users from accessing shopping routes
    if (isAuthenticated && user?.role === "admin" && location.pathname.includes("/shop")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <>{children}</>;
}

export default CheckAuth;
