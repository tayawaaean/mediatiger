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
      
      // Check both user_requests status AND if user has approved channels
      Promise.all([
        fetchUserRequest(supabase, user.id),
        // Also check if user has approved channels
        supabase
          .from('channels')
          .select('id, status')
          .or(`user_id.eq.${user.id},main_request_id.eq.${user.id}`)
          .eq('status', 'approved')
      ])
        .then(([requestData, channelsData]) => {
          console.log("[useDashboardAuth] user request data: ", requestData);
          console.log("[useDashboardAuth] user channels data: ", channelsData);
          
          if (requestData.length == 0) {
            setShowOnboarding(true);
            setIsLoading(false);
            return;
          }
          
          // Set hasChanel to true if user has approved status OR has approved channels
          if (requestData[0].status == "approved" || (channelsData.data && channelsData.data.length > 0)) {
            setHasChanel(true);
            console.log("[useDashboardAuth] Setting hasChanel to true - user approved or has approved channels");
          }
          
          if (requestData[0].status == "rejected") {
            setReason(requestData[0]?.rejection_reason);
            setIsRejected(true);
            setIsLoading(false);
          }
          if (requestData[0].status === "pending") {
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
