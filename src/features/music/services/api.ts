import { supabase } from "./supabase";
import { CustomRequest } from "../types";
import { useState } from "react";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface SubmitRequestPayload {
  reference_tracks: string[];
  description: string;
  example_videos: string[];
}

interface UseFormSubmissionReturn {
  isSubmitting: boolean;
  submitError: string | null;
  submitForm: (
    payload: SubmitRequestPayload
  ) => Promise<{ success: boolean; id?: string }>;
  clearError: () => void;
}

export interface Favorite {
  id: string;
  user_id: string;
  music_id: string;
  created_at: string;
}

export const useFormSubmission = (): UseFormSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitForm = async (payload: SubmitRequestPayload) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitCustomTrackRequest(payload);

      if (response.success) {
        return { success: true, id: response.data.id };
      } else {
        setSubmitError(response.message || "Failed to submit request");
        return { success: false };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setSubmitError(null);
  };

  return {
    isSubmitting,
    submitError,
    submitForm,
    clearError,
  };
};

export const submitCustomTrackRequest = async (
  payload: SubmitRequestPayload
): Promise<ApiResponse<{ id: string }>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
        data: { id: "" },
      };
    }

    const { data, error } = await supabase
      .from("custom_track_requests")
      .insert({
        user_id: user.id,
        submitted_by: user.user_metadata?.full_name || "Anonymous",
        reference_tracks: payload.reference_tracks,
        description: payload.description,
        example_videos: payload.example_videos,
        priority: "medium",
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message, data: { id: "" } };
    }

    return {
      success: true,
      data: { id: data.id },
      message: "Request submitted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: { id: "" },
    };
  }
};

export const fetchUserRequests = async (): Promise<
  ApiResponse<CustomRequest[]>
> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "User not authenticated", data: [] };
    }

    const { data, error } = await supabase
      .from("custom_track_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as CustomRequest[] };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: [],
    };
  }
};

export const fetchAllRequests = async (): Promise<
  ApiResponse<CustomRequest[]>
> => {
  try {
    const { data, error } = await supabase
      .from("custom_track_requests")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as CustomRequest[] };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: [],
    };
  }
};

export const updateRequestStatus = async (
  requestId: string,
  status: string
): Promise<ApiResponse<void>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
        data: undefined,
      };
    }

    // Check if the user is an admin
    const isAdmin = user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return {
        success: false,
        message: "Only admins can update request status",
        data: undefined,
      };
    }

    // Validate status is one of the allowed values
    if (!["pending", "completed", "rejected"].includes(status)) {
      return {
        success: false,
        message: "Invalid status value",
        data: undefined,
      };
    }

    const { error } = await supabase
      .from("custom_track_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      return { success: false, message: error.message, data: undefined };
    }

    return {
      success: true,
      message: "Status updated successfully",
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: undefined,
    };
  }
};

export const rejectRequestStatus = async (
  requestId: string
): Promise<ApiResponse<void>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
        data: undefined,
      };
    }

    // Check if the user is an admin
    const isAdmin = user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return {
        success: false,
        message: "Only admins can reject request status",
        data: undefined,
      };
    }

    const { error } = await supabase
      .from("custom_track_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      return { success: false, message: error.message, data: undefined };
    }

    return {
      success: true,
      message: "Request rejected successfully",
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: undefined,
    };
  }
};

export const addRequestNote = async (
  requestId: string,
  note: string
): Promise<ApiResponse<void>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
        data: undefined,
      };
    }

    // Check if the user is an admin
    const isAdmin = user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return {
        success: false,
        message: "Only admins can add notes",
        data: undefined,
      };
    }

    const { error } = await supabase
      .from("custom_track_requests")
      .update({ notes: note })
      .eq("id", requestId);

    if (error) {
      return { success: false, message: error.message, data: undefined };
    }

    return {
      success: true,
      message: "Note added successfully",
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: undefined,
    };
  }
};

export const fetchFavorites = async (): Promise<ApiResponse<string[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "User not authenticated", data: [] };
    }

    const { data, error } = await supabase
      .from("music_favorites")
      .select("music_id")
      .eq("user_id", user.id);

    if (error) {
      return { success: false, message: error.message, data: [] };
    }

    return {
      success: true,
      data: data.map((fav) => fav.music_id),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: [],
    };
  }
};

export const toggleFavorite = async (
  musicId: string
): Promise<ApiResponse<void>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
        data: undefined,
      };
    }

    const { data: existing, error: fetchError } = await supabase
      .from("music_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("music_id", musicId)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means "row not found", which is expected if not yet favorited
      return { success: false, message: fetchError.message, data: undefined };
    }

    if (existing) {
      const { error } = await supabase
        .from("music_favorites")
        .delete()
        .eq("id", existing.id)
        .select("id");

      if (error) {
        return { success: false, message: error.message, data: undefined };
      }

      return { success: true, data: undefined };
    } else {
      const { error } = await supabase
        .from("music_favorites")
        .insert({ user_id: user.id, music_id: musicId })
        .select("id");

      if (error) {
        return { success: false, message: error.message, data: undefined };
      }

      return { success: true, data: undefined };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      data: undefined,
    };
  }
};
