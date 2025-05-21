import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./routeConstants";

// Auth pages
import Login from "../features/auth/pages/Login";
import PurpleLogin from "../features/auth/pages/PurpleLogin";
import SignUp from "../features/auth/pages/SignUp";
import Welcome from "../pages/Welcome";

// Feature landing pages
import BoutiqueMonetization from "../pages/BoutiqueMonetization";
import ChannelManagement from "../pages/ChannelManagement";
import DigitalRights from "../features/DigitalRights";
import GlobalDistribution from "../features/GlobalDistribution";
import TwoFactor from "../pages/TwoFactor.tsx";

const PublicRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.SIGNUP} element={<SignUp />} />
        <Route path={ROUTES.TWO_FACTOR} element={<TwoFactor />} /> {/* ✅ 2FA route */}

        <Route path={ROUTES.ADMIN_LOGIN} element={<PurpleLogin />} />
      <Route path={ROUTES.WELCOME} element={<Welcome />} />

      {/* Feature preview routes */}
      <Route path={ROUTES.CHANNEL_MANAGEMENT} element={<ChannelManagement />} />
      <Route path={ROUTES.DIGITAL_RIGHTS} element={<DigitalRights />} />
      <Route
        path={ROUTES.GLOBAL_DISTRIBUTION}
        element={<GlobalDistribution />}
      />
      <Route
        path={ROUTES.BOUTIQUE_MONETIZATION}
        element={<BoutiqueMonetization />}
      />
    </Routes>
  );
};

export default PublicRoutes;
