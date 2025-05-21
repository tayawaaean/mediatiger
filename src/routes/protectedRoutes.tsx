import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { ROUTES } from "./routeConstants";
import { LanguageProvider } from "../contexts/LanguageContext";
import { NotificationsProvider } from "../hooks/useNotifications";
import { useAuth } from "../contexts/AuthContext";

// Protected pages
import AdminPanel from "../features/admin/pages/AdminPanel";
import Dashboard from "../features/dashboard/pages/Dashboard";
import LabelGrowth from "../pages/LabelGrowth";
import Messages from "../pages/Messages";
import ShowGrowth from "../pages/ShowGrowth";
import UpdateNamePage from "../pages/UpdateNamePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";

interface RoleBasedRouteProps {
    requiredRole: string;
    fallbackPath?: string;
    children: ReactNode;
}

const RoleBasedRoute = ({ requiredRole, fallbackPath = ROUTES.DASHBOARD, children }: RoleBasedRouteProps) => {
    const { user, isAdmin } = useAuth();

    // For admin role, use the isAdmin function from the auth context
    if (requiredRole === "admin") {
        if (isAdmin()) {
            return <>{children}</>;
        }
        return <Navigate to={fallbackPath} />;
    }

    // For other roles, check user_metadata.role
    if (user && user.user_metadata?.role === requiredRole) {
        return <>{children}</>;
    }

    return <Navigate to={fallbackPath} />;
};

const ProtectedRoutes = () => {
    return (
        <LanguageProvider>
            <NotificationsProvider>
                <Routes>
                    <Route
                        path={ROUTES.DASHBOARD}
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.ADMIN_PANEL}
                        element={
                            <ProtectedRoute>
                                <RoleBasedRoute requiredRole="admin" fallbackPath={ROUTES.DASHBOARD}>
                                    <AdminPanel />
                                </RoleBasedRoute>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.MESSAGES}
                        element={
                            <ProtectedRoute>
                                <Messages />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.LABEL_GROWTH}
                        element={
                            <ProtectedRoute>
                                <LabelGrowth />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.SHOW_GROWTH}
                        element={
                            <ProtectedRoute>
                                <ShowGrowth />
                            </ProtectedRoute>
                        }
                    />

                    {/* User settings routes */}
                    <Route
                        path={ROUTES.UPDATE_NAME}
                        element={
                            <ProtectedRoute>
                                <UpdateNamePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.CHANGE_PASSWORD}
                        element={
                            <ProtectedRoute>
                                <ChangePasswordPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect unauthorized access */}
                    <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
                </Routes>
            </NotificationsProvider>
        </LanguageProvider>
    );
};

export default ProtectedRoutes;