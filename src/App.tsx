import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import { ROUTES } from "./routes/routeConstants";
import { setDocumentTitle } from "./utils/titleUtils";

function App() {
  const location = useLocation();
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      [ROUTES.HOME]: "Home",
      [ROUTES.LOGIN]: "Log In",
      [ROUTES.SIGNUP]: "Sign Up",
      [ROUTES.WELCOME]: "Welcome",
      [ROUTES.DASHBOARD]: "Dashboard",
      [ROUTES.CHANNEL_MANAGEMENT]: "Channel Management",
      [ROUTES.BOUTIQUE_MONETIZATION]: "Boutique Monetization",
      [ROUTES.ADMIN_PANEL]: "Admin Panel",
      [ROUTES.MESSAGES]: "Messages",
      [ROUTES.LABEL_GROWTH]: "Label Growth",
      [ROUTES.SHOW_GROWTH]: "Show Growth",
      [ROUTES.ADMIN_LOGIN]: "Admin Login",
      [ROUTES.DIGITAL_RIGHTS]: "Digital Rights",
      [ROUTES.GLOBAL_DISTRIBUTION]: "Global Distribution",
      [ROUTES.UPDATE_NAME]: "Update Name",
      [ROUTES.CHANGE_PASSWORD]: "Change Password",
      [ROUTES.TWO_FACTOR]: "2FA Verification", // ✅ Add this line
    };

    const currentTitle = routeTitles[location.pathname] || "Page Not Found";
    setDocumentTitle(currentTitle);
  }, [location]);


  return <AppRoutes />;
}

export default App;
