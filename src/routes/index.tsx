import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import HomePage from "../pages/HomePage";
import ProtectedRoutes from "./protectedRoutes";
import PublicRoutes from "./publicRoutes";
import { ROUTES } from "./routeConstants";
import MusicPage from "../pages/music/index";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading screen while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <span className="text-white text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Home route */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.MUSIC} element={<MusicPage />} />
      {/* Choose between protected and public routes based on authentication status */}
      {user ? (
        <Route path="/*" element={<ProtectedRoutes />} />
      ) : (
        <>
          <Route path="/*" element={<PublicRoutes />} />
          {/* Redirect dashboard attempts to home if not logged in */}
          <Route
            path={ROUTES.DASHBOARD}
            element={<Navigate to={ROUTES.HOME} replace />}
          />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
