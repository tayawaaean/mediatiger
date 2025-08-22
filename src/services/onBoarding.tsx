import { supabase } from "../lib/supabase";
import { updateUserRequestMetadata } from "../utils/channelValidation";

/**
 * Fetches YouTube channel metadata (name and thumbnail) from YouTube API
 * @param channelUrl - The YouTube channel URL
 * @returns Promise with channel name and thumbnail, or null if failed
 */
async function fetchYouTubeChannelMetadata(channelUrl: string): Promise<{ name: string; thumbnail: string; metadata: any } | null> {
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
    
    // Use the default thumbnail (88x88) as specified
    const thumbnailUrl = snippet?.thumbnails?.default?.url ||
                        `https://via.placeholder.com/88x88/FF0000/FFFFFF?text=${encodeURIComponent(channelHandle)}`;

    // Store additional metadata
    const metadata = {
      channelId: channel.id.channelId,
      description: snippet?.description || '',
      publishedAt: snippet?.publishedAt,
      country: snippet?.country,
      customUrl: snippet?.customUrl,
      thumbnails: snippet?.thumbnails
    };

    console.log('Fetched channel metadata:', { name: channelName, thumbnail: thumbnailUrl, metadata });
    
    return {
      name: channelName,
      thumbnail: thumbnailUrl,
      metadata
    };
  } catch (error) {
    console.error('Error fetching YouTube channel metadata:', error);
    return null;
  }
}

export const verifyChannel = async (
  channelUrl: string,
  userId: string,
  showUniqueToast: any,
  setChannelInfo: any,
  setIsVerifying: any
) => {
  setIsVerifying(true);
  try {
    // First check if channel is already registered
    const { data: existingRequest, error: checkError } = await supabase
      .from("user_requests")
      .select("id")
      .filter("youtube_links", "cs", `{"${channelUrl}"}`)
      .filter("status", "eq", "approved")
      .not("user_id", "eq", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingRequest) {
      showUniqueToast(
        "This YouTube channel is already registered with another account",
        "error",
        "channel-exists"
      );
      setChannelInfo((prev: any) => ({
        ...prev,
        verifiedChannels: {
          ...prev.verifiedChannels,
          [channelUrl]: false,
        },
      }));
      return;
    }

    // Fetch YouTube channel metadata
    const channelMetadata = await fetchYouTubeChannelMetadata(channelUrl);
    
    // Update user_requests with channel metadata if available
    if (channelMetadata) {
      const success = await updateUserRequestMetadata(
        userId,
        channelUrl,
        channelMetadata.name,
        channelMetadata.thumbnail,
        channelMetadata.metadata
      );
      
      if (success) {
        console.log('Successfully stored channel metadata for:', channelUrl);
      } else {
        console.warn('Failed to store channel metadata for:', channelUrl);
      }
    }

    // Simulate API call to check channel description
    // In production, this would be a real API call to YouTube's API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, randomly verify
    const isVerified = true;

    setChannelInfo((prev: any) => ({
      ...prev,
      verifiedChannels: {
        ...prev.verifiedChannels,
        [channelUrl]: isVerified,
      },
    }));

    if (isVerified) {
      const channelName = channelMetadata?.name || 'Channel';
      showUniqueToast(
        `Channel verified successfully! ${channelName}`,
        "success",
        "channel-verified"
      );
    } else {
      showUniqueToast(
        "Verification code not found in channel description",
        "error",
        "verification-failed"
      );
    }
  } catch (error) {
    showUniqueToast("Failed to verify channel", "error", "verification-error");
  } finally {
    setIsVerifying(false);
  }
};

export const handleChannelInfoChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setChannelInfo: React.Dispatch<React.SetStateAction<any>>
) => {
  const { name, value } = e.target;
  console.log("is this working");
  if (name.startsWith("youtubeLink")) {
    const index = parseInt(name.replace("youtubeLink", ""));
    setChannelInfo((prev: any) => ({
      ...prev,
      youtubeLinks: prev.youtubeLinks.map((link: string, i: number) =>
        i === index ? value : link
      ),
    }));
  } else {
    setChannelInfo((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  }
};

export const handleSubmitInterests = async (
  interests: {
    channelManagement: boolean;
    musicPartnerProgram: boolean;
    digitalRights: boolean;
    other: boolean;
  },
  otherInterest: string,
  channelInfo: {
    youtubeLinks: string[];
    verifiedChannels: { [key: string]: boolean };
  },
  digitalRightsInfo: {
    website: string;
    youtubeChannels: string[];
  },
  showUniqueToast: any,
  setStep: (step: number) => void,
  handleFinalSubmit: () => Promise<void>
) => {
  // Check if at least one interest is selected
  if (
    !interests.channelManagement &&
    !interests.musicPartnerProgram &&
    !interests.digitalRights &&
    !interests.other
  ) {
    showUniqueToast(
      "Please select at least one option",
      "error",
      "interests-required"
    );
    return;
  }

  // If other is selected but no text is provided
  if (interests.other && !otherInterest.trim()) {
    showUniqueToast(
      "Please specify your other interest",
      "error",
      "other-interest-required"
    );
    return;
  }

  // If Channel Management or Music Partner Program is selected, validate YouTube URLs and verification
  if (
    (interests.channelManagement || interests.musicPartnerProgram) &&
    !channelInfo.youtubeLinks[0]
  ) {
    showUniqueToast(
      "Please provide your YouTube channel URL",
      "error",
      "youtube-required"
    );
    return;
  }

  // Check if all channels are verified
  if (interests.channelManagement || interests.musicPartnerProgram) {
    const unverifiedChannels = channelInfo.youtubeLinks.filter(
      (link) => link.trim() && !channelInfo.verifiedChannels[link]
    );

    if (unverifiedChannels.length > 0) {
      showUniqueToast(
        "Please verify all YouTube channels before continuing",
        "error",
        "unverified-channels"
      );
      return;
    }
  }

  // Validate Digital Rights fields if selected
  if (interests.digitalRights) {
    if (!digitalRightsInfo.website.trim()) {
      showUniqueToast(
        "Please provide your website URL",
        "error",
        "website-required"
      );
      return;
    }
    if (!digitalRightsInfo.youtubeChannels[0]?.trim()) {
      showUniqueToast(
        "Please provide your YouTube channel URL",
        "error",
        "youtube-required"
      );
      return;
    }
  }

  // Proceed to step 2 for additional info
  if (
    ((interests.channelManagement || interests.musicPartnerProgram) &&
      channelInfo.youtubeLinks[0]) ||
    interests.digitalRights
  ) {
    setStep(2);
  } else {
    // If only "other" is selected, submit directly
    await handleFinalSubmit();
  }
};
