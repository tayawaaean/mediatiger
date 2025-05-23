import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface ApplicationStatusHandlerProps {
  id: string;
  status: "approved" | "rejected";
  reason?: string;
  adminId: string;
  activeTab: string;
  onSuccess: {
    setShowRejectionModal: (show: boolean) => void;
    setRejectionReason: (reason: string) => void;
    setSelectedApplicationId: (id: string | null) => void;
    loadApplications: () => void;
    loadRequests?: () => void;
    setShowRejectionModalChannel: (show: boolean) => void;
  };
}

export const handleApplicationStatus = async ({
  id,
  status,
  reason,
  adminId,
  activeTab,
  onSuccess,
}: ApplicationStatusHandlerProps) => {
  try {
    if (activeTab === "applications") {
      console.log({
        admin_id: adminId,
        application_id: id,
        new_status: status,
        reason: status === "rejected" ? reason : `Application ${status}`,
      });
      const { error } = await supabase.rpc("update_application_status_with_admin", {
        admin_id: adminId,
        application_id: id,
        new_status: status,
        reason: status === "rejected" ? reason : `Application ${status}`,
      });
      console.log("another one")
      if (error) throw error;
      toast.success(`Application ${status} successfully`);
      // Handle success callbacks
      onSuccess.setShowRejectionModal(false);
      onSuccess.setRejectionReason("");
      onSuccess.setSelectedApplicationId(null);
      onSuccess.loadApplications();
    } else if (activeTab === "yt-channels") {
      const { error } = await supabase
        .from("channels")
        .update({
          viewed_by: adminId,
          status: status,
          reason: status === "rejected" ? reason : `Channel ${status}`,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Channel request ${status} successfully`);
      
      // Handle success callbacks
      onSuccess.setShowRejectionModalChannel(false);
      onSuccess.setRejectionReason("");
      onSuccess.setSelectedApplicationId(null);
      onSuccess.loadRequests();
    }
    
  } catch (err) {
    console.error("Error updating application status:", err);
    toast.error("Failed to update application status");
    throw err;
  }
};