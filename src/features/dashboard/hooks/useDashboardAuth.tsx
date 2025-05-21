import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import { ExtendedUser } from "../../../types/user";
import { checkUserIfBanned, fetchUserRequest } from "../../../utils/auth";

export interface DashboardAuthState {
  user: ExtendedUser | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isRejected: boolean;
  reason: string;
  hasChanel: boolean;
  isBanned: boolean;
  isPending: boolean;
  setHasChanel: (value: boolean) => void;
}

export function useDashboardAuth(): DashboardAuthState {
  // Get user and signOut from auth context
  const { user, signOut, setShowOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [reason, setReason] = useState("");
  const [hasChanel, setHasChanel] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      checkUserIfBanned(supabase, user, setIsBanned);
      fetchUserRequest(supabase, user.id)
        .then((data) => {
          console.log("[useDashboardAuth] user data: ", data);
          if (data.length == 0) {
            setShowOnboarding(true);
            setIsLoading(false);
            return;
          }
          if (data[0].status == "approved") {
            setHasChanel(true);
          }
          if (data[0].status == "rejected") {
            setReason(data[0]?.rejection_reason);
            setIsRejected(true);
            setIsLoading(false);
          }
          if (data[0].status === "pending") {
            setIsPending(true);
          }
        })
        .catch(() => {
          setIsRejected(true);
          setReason("Failed to fetch user data.");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user, setShowOnboarding, navigate]);

  return {
    user,
    signOut,
    isLoading,
    isRejected,
    reason,
    hasChanel,
    isBanned,
    isPending,
    setHasChanel,
  };
}
