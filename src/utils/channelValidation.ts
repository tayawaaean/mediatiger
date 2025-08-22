import { supabase } from '../lib/supabase';

export interface ChannelValidationResult {
  isValid: boolean;
  error?: string;
  existingChannel?: {
    id: string;
    status: string;
    user_id: string;
    channel_name?: string;
    thumbnail?: string;
  };
  existingRequest?: {
    id: string;
    status: string;
    user_id: string;
  };
  channelMetadata?: {
    name: string;
    thumbnail: string;
  };
}

/**
 * Fetches YouTube channel metadata (name and thumbnail) from YouTube API
 * @param channelUrl - The YouTube channel URL
 * @returns Promise with channel name and thumbnail, or null if failed
 */
export async function fetchYouTubeChannelMetadata(channelUrl: string): Promise<{ name: string; thumbnail: string } | null> {
  try {
    // Extract channel handle from URL
    const channelHandle = channelUrl.match(/youtube\.com\/(@[^\/]+)/)?.[1];
    if (!channelHandle) {
      console.warn('Could not extract channel handle from URL:', channelUrl);
      return null;
    }

    // Get YouTube API key from environment
    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not found, returning null');
      return null;
    }

    // Fetch real channel data from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelHandle}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    const channel = data?.items?.[0];
    
    if (!channel || channel.id?.kind !== 'youtube#channel') {
      console.warn('No channel found for:', channelHandle);
      return null;
    }

    const snippet = channel.snippet;
    const channelName = snippet?.title || channelHandle.replace('@', '') + ' Channel';
    
    // Use the default thumbnail (88x88) as specified by the user
    const thumbnailUrl = snippet?.thumbnails?.default?.url ||
                        `https://via.placeholder.com/88x88/FF0000/FFFFFF?text=${encodeURIComponent(channelHandle)}`;

    console.log('Fetched channel metadata:', { name: channelName, thumbnail: thumbnailUrl });
    
    return {
      name: channelName,
      thumbnail: thumbnailUrl
    };
  } catch (error) {
    console.error('Error fetching YouTube channel metadata:', error);
    return null;
  }
}

/**
 * Validates a YouTube channel URL to prevent duplicate submissions
 * @param channelUrl - The YouTube channel URL to validate
 * @param userId - The current user's ID
 * @param type - The type of submission ('channel' or 'main')
 * @returns ChannelValidationResult with validation status and details
 */
export async function validateChannelSubmission(
  channelUrl: string,
  userId: string,
  type: 'channel' | 'main' = 'channel'
): Promise<ChannelValidationResult> {
  try {
    // Basic URL validation
    const youtubeUrlRegex = /^https:\/\/(?:www\.)?youtube\.com\/[@a-zA-Z0-9-_]+$/;
    if (!youtubeUrlRegex.test(channelUrl)) {
      return {
        isValid: false,
        error: 'INVALID_URL'
      };
    }

    // Check if channel already exists in the channels table
    const { data: existingChannel, error: channelCheckError } = await supabase
      .from("channels")
      .select("id, status, user_id")
      .eq("link", channelUrl)
      .single();

    // Handle PGRST116 (no rows found) - this is expected for new channels
    if (channelCheckError) {
      if (channelCheckError.code === 'PGRST116') {
        // No channel found - this is good, means we can proceed
        console.log("No existing channel found - proceeding with validation");
      } else {
        console.error("Error checking existing channels:", channelCheckError);
        return {
          isValid: false,
          error: 'CHECK_ERROR'
        };
      }
    }

    if (existingChannel) {
      if (existingChannel.user_id === userId) {
        if (existingChannel.status === 'pending') {
          return {
            isValid: false,
            error: 'ALREADY_PENDING',
            existingChannel
          };
        } else if (existingChannel.status === 'approved') {
          return {
            isValid: false,
            error: 'ALREADY_APPROVED',
            existingChannel
          };
        } else if (existingChannel.status === 'rejected') {
          // Allow resubmission of rejected channels
          console.log("Channel was previously rejected, allowing resubmission");
        }
      } else {
        // Channel exists with another user
        return {
          isValid: false,
          error: 'ALREADY_REGISTERED_BY_OTHER_USER',
          existingChannel
        };
      }
    }

    // Check if channel is already in user_requests (for main requests)
    if (type === "main") {
      const { data: existingRequest, error: requestCheckError } = await supabase
        .from("user_requests")
        .select("id, status, user_id")
        .contains("youtube_links", [channelUrl])
        .single();

      // Handle PGRST116 (no rows found) - this is expected for new requests
      if (requestCheckError) {
        if (requestCheckError.code === 'PGRST116') {
          // No request found - this is good, means we can proceed
          console.log("No existing request found - proceeding with validation");
        } else {
          console.error("Error checking existing requests:", requestCheckError);
          return {
            isValid: false,
            error: 'CHECK_ERROR'
          };
        }
      }

      if (existingRequest) {
        if (existingRequest.user_id === userId) {
          if (existingRequest.status === 'pending') {
            return {
              isValid: false,
              error: 'ALREADY_PENDING',
              existingRequest
            };
          } else if (existingRequest.status === 'approved') {
            return {
              isValid: false,
              error: 'ALREADY_APPROVED',
              existingRequest
            };
          }
        } else {
          // Channel exists in another user's request
          return {
            isValid: false,
            error: 'ALREADY_REGISTERED_BY_OTHER_USER',
            existingRequest
          };
        }
      }
    }

    // All validations passed
    // Fetch channel metadata for new channels
    const channelMetadata = await fetchYouTubeChannelMetadata(channelUrl);
    
    return {
      isValid: true,
      channelMetadata: channelMetadata || undefined
    };

  } catch (error) {
    console.error("Error during channel validation:", error);
    return {
      isValid: false,
      error: 'VALIDATION_ERROR'
    };
  }
}

/**
 * Gets a user-friendly error message for validation errors
 * @param error - The error code from validation
 * @param translate - Translation function
 * @returns Localized error message
 */
export function getChannelValidationErrorMessage(error: string, translate: (key: string) => string): string {
  switch (error) {
    case 'INVALID_URL':
      return translate('channel.invalidUrl');
    case 'ALREADY_PENDING':
      return translate('channel.alreadyPendingReview');
    case 'ALREADY_APPROVED':
      return translate('channel.alreadyApproved');
    case 'ALREADY_REGISTERED_BY_OTHER_USER':
      return translate('channel.alreadyRegisteredByAnotherUser');
    case 'CHECK_ERROR':
      return translate('channel.checkError');
    case 'VALIDATION_ERROR':
      return translate('channel.validationError');
    default:
      return translate('channel.unknownError');
  }
}

/**
 * Checks if a channel can be resubmitted (e.g., after rejection)
 * @param channelUrl - The YouTube channel URL
 * @param userId - The current user's ID
 * @returns Promise<boolean> - True if channel can be resubmitted
 */
export async function canResubmitChannel(
  channelUrl: string,
  userId: string
): Promise<boolean> {
  try {
    const { data: existingChannel } = await supabase
      .from("channels")
      .select("status")
      .eq("link", channelUrl)
      .eq("user_id", userId)
      .single();

    // Allow resubmission if channel was rejected
    return existingChannel?.status === 'rejected';
  } catch (error) {
    console.error("Error checking if channel can be resubmitted:", error);
    return false;
  }
}

/**
 * Refreshes channel metadata for an existing channel
 * @param channelUrl - The YouTube channel URL
 * @returns Promise with updated channel name and thumbnail
 */
export async function refreshChannelMetadata(channelUrl: string): Promise<{ name: string; thumbnail: string } | null> {
  return fetchYouTubeChannelMetadata(channelUrl);
}

/**
 * Updates existing channel metadata in the database
 * @param channelId - The channel ID to update
 * @param name - New channel name (can be null if API failed)
 * @param thumbnail - New channel thumbnail URL (can be null if API failed)
 * @returns Promise<boolean> - True if update was successful
 */
export async function updateChannelMetadata(
  channelId: string,
  name: string | null,
  thumbnail: string | null
): Promise<boolean> {
  try {
    // Build update object without updated_at first
    const updateData: any = { 
      channel_name: name, 
      thumbnail 
    };
    
    // Only add updated_at if the column exists (will be handled by trigger if available)
    // For now, we'll skip it to avoid errors
    
    const { error } = await supabase
      .from('channels')
      .update(updateData)
      .eq('id', channelId);

    if (error) {
      console.error('Error updating channel metadata:', error);
      return false;
    }

    console.log('Successfully updated channel metadata for:', channelId);
    return true;
  } catch (error) {
    console.error('Error updating channel metadata:', error);
    return false;
  }
}

/**
 * Fetches and updates channel metadata for all channels without names/thumbnails
 * @returns Promise<number> - Number of channels updated
 */
export async function refreshAllChannelMetadata(): Promise<number> {
  try {
    // Get all channels without metadata
    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, link')
      .or('channel_name.is.null,thumbnail.is.null');

    if (error) {
      console.error('Error fetching channels for metadata update:', error);
      return 0;
    }

    let updatedCount = 0;
    
    for (const channel of channels || []) {
      const metadata = await fetchYouTubeChannelMetadata(channel.link);
      if (metadata) {
        const success = await updateChannelMetadata(channel.id, metadata.name, metadata.thumbnail);
        if (success) updatedCount++;
      } else {
        // If API fails, set metadata to null to indicate no data available
        const success = await updateChannelMetadata(channel.id, null, null);
        if (success) {
          console.log(`Set metadata to null for channel: ${channel.link} (API failed)`);
        }
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Updated metadata for ${updatedCount} channels`);
    return updatedCount;
  } catch (error) {
    console.error('Error refreshing all channel metadata:', error);
    return 0;
  }
}

/**
 * Updates user_requests table with YouTube channel metadata
 * @param userId - The user ID to update
 * @param channelUrl - The YouTube channel URL
 * @param name - Channel name
 * @param thumbnail - Channel thumbnail URL
 * @param metadata - Additional channel metadata
 * @returns Promise<boolean> - True if update was successful
 */
export async function updateUserRequestMetadata(
  userId: string,
  channelUrl: string,
  name: string,
  thumbnail: string,
  metadata?: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_requests')
      .update({
        youtube_channel_name: name,
        youtube_channel_thumbnail: thumbnail,
        youtube_channel_metadata: metadata || null
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user request metadata:', error);
      return false;
    }

    console.log('Successfully updated user request metadata for user:', userId);
    return true;
  } catch (error) {
    console.error('Error updating user request metadata:', error);
    return false;
  }
}
