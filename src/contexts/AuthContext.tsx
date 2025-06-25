import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { isCORSError, supabase } from "../lib/supabase";
import { AuthState, ExtendedUser } from "../types/user";
import { ROUTES } from "../routes/routeConstants";

const AuthContext = createContext<AuthState | undefined>(undefined);
const shownToasts = new Set<string>();

const showUniqueToast = (
  message: string,
  type: "success" | "error",
  id?: string
) => {
  const toastId = id || message;
  if (!shownToasts.has(toastId)) {
    // Dismiss all existing toasts
    toast.dismiss();
    shownToasts.add(toastId);
    type === "success"
      ? toast.success(message, { id: toastId, duration: 3000 })
      : toast.error(message, { id: toastId, duration: 3000 });
    setTimeout(() => shownToasts.delete(toastId), 3000);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirected, setIsRedirected] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasShownVerification, setHasShownVerification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = (): boolean => {
    if (!user) return false;
    if (user.user_metadata?.role === "admin") {
      return true;
    }
    return !!user.user_metadata?.isAdmin;
  };

  const getRedirectPath = (user: ExtendedUser | null): string => {
    if (user?.user_metadata?.role === "admin") {
      console.log("User is admin. Redirecting to admin panel");
      return ROUTES.ADMIN_PANEL;
    }
    console.log("User is not admin. Redirecting to dashboard");
    return ROUTES.DASHBOARD;
  };

  useEffect(() => {
    setLoading(true);

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        const currentUser = session?.user ?? null;

        if (currentUser) {
          setUser(currentUser as ExtendedUser);
          console.log("Current user metadata:", currentUser.user_metadata);

          if (currentUser.email_confirmed_at && !isRedirected) {
            setIsRedirected(true);
            const redirectPath = getRedirectPath(currentUser as ExtendedUser);
            navigate(redirectPath, { replace: true });
          }
        }

        setLoading(false);
      })
      .catch((error) => {
        if (isCORSError(error)) {
          showUniqueToast(
            "CORS Error: Unable to authenticate.",
            "error",
            "cors-auth-error"
          );
        }
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;

      if (currentUser) {
        setUser(currentUser as ExtendedUser);
        console.log(
          "Auth state change - user metadata:",
          currentUser.user_metadata
        );

        if (currentUser.email_confirmed_at && !hasShownVerification) {
          setHasShownVerification(true);

          if (!currentUser.user_metadata?.email_verification_notification) {
            await supabase.auth.updateUser({
              data: { email_verification_notification: true },
            });

            showUniqueToast(
              "Email verified successfully!",
              "success",
              "email-verified"
            );
          }

          const redirectPath = getRedirectPath(currentUser as ExtendedUser);
          navigate(redirectPath, { replace: true });
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    refferal?: boolean
  ) => {
    const currentOrigin = window.location.origin;
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          onboarding_complete: false,
          role: "user",
          isReferal: refferal,
        },
        emailRedirectTo: `${currentOrigin}/welcome`,
      },
    });
    if (error) throw error;
    if (data.user && !data.user.confirmed_at) {
      showUniqueToast(
        "Check your email to confirm your registration.",
        "success",
        "signup-email-sent"
      );
    }
    return data.user?.id;
  };

  const signIn = async (
    email: string,
    password: string,
    isAdminLogin: boolean = false
  ) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user && !data.user.email_confirmed_at) {
      throw new Error("Verify your email first.");
    }

    const hasTOTP = data.user?.factors?.some(
      (f) => f.factor_type === "totp" && f.status === "verified"
    );

    if (hasTOTP) {
      localStorage.setItem("partial_token", data.session?.access_token || "");
      navigate("/2fa", { replace: true });
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    const isAdmin =
      profileData?.is_admin || data.user.user_metadata?.role === "admin";

    if (isAdmin && data.user.user_metadata?.role !== "admin") {
      await supabase.auth.updateUser({
        data: { role: "admin" },
      });

      setUser({
        ...data.user,
        user_metadata: {
          ...data.user.user_metadata,
          role: "admin",
        },
      } as ExtendedUser);
    }

    showUniqueToast("Successfully logged in!", "success", "signin-success");

    const redirectPath = isAdmin ? ROUTES.ADMIN_PANEL : ROUTES.DASHBOARD;
    navigate(redirectPath, { replace: true });
  };

  const signOut = async (): Promise<void> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate(ROUTES.LOGIN);
        return;
      }

      const isOnAdminPage =
        location.pathname.includes("/admin") ||
        location.pathname === ROUTES.ADMIN_PANEL;

      await supabase.auth.signOut();

      localStorage.clear();
      sessionStorage.clear();

      showUniqueToast("Signed out successfully", "success", "signout-success");

      if (isOnAdminPage) {
        navigate(ROUTES.ADMIN_LOGIN);
      } else {
        navigate(ROUTES.LOGIN);
      }
    } catch {
      localStorage.clear();
      sessionStorage.clear();

      const isOnAdminPage =
        location.pathname.includes("/admin") ||
        location.pathname === ROUTES.ADMIN_PANEL;

      if (isOnAdminPage) {
        navigate(ROUTES.ADMIN_LOGIN);
      } else {
        navigate(ROUTES.LOGIN);
      }
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const timestamp = new Date().getTime();
    const currentOrigin = window.location.origin;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${currentOrigin}/welcome?t=${timestamp}` },
    });
    if (error) throw error;
    return {
      success: true,
      message: "Verification email has been resent. Please check your inbox.",
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        showOnboarding,
        setShowOnboarding,
        resendVerificationEmail,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
