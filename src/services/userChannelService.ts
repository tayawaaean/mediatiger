import { supabase } from '../lib/supabase';
import { ChannelInfo } from './analyticsService';

export interface UserChannelInfo {
  id: string;
  name: string;
  status: string;
  thumbnail: string;
  registration_date: string;
  approval_date: string;
  link: string;
  channel_name: string | null;
}

export interface UserChannelsResponse {
  success: boolean;
  channels: ChannelInfo[];
  total: number;
  message: string;
}

/**
 * Service to fetch channels available to the logged-in user
 * Only channels with status = 'approved' will be returned
 */
class UserChannelService {
  /**
   * Fetch channels available to the current user
   */
  async fetchUserChannels(userId: string): Promise<UserChannelsResponse> {
    try {
      // First, get the user's main request to see what channels they're linked to
      const { data: userRequest, error: requestError } = await supabase
        .from('user_requests')
        .select('id, youtube_links, youtube_channel_name, youtube_channel_thumbnail, status')
        .eq('user_id', userId)
        .single();

      if (requestError) {
        console.error('Error fetching user request:', requestError);
        return {
          success: false,
          channels: [],
          total: 0,
          message: 'Failed to fetch user channels'
        };
      }

      // Get channels from the channels table that belong to this user's request AND are approved
      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .eq('main_request_id', userRequest.id)
        .eq('status', 'approved');

      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
        return {
          success: false,
          channels: [],
          total: 0,
          message: 'Failed to fetch channels'
        };
      }

      console.log('Debug - User request:', userRequest);
      console.log('Debug - Channels data:', channelsData);

      // Combine channels from both sources
      const allChannels: ChannelInfo[] = [];

      // Add main channels from user_requests ONLY if the user request is approved
      if (userRequest?.status === 'approved' && userRequest?.youtube_links && userRequest.youtube_links.length > 0) {
        userRequest.youtube_links.forEach((link: string, index: number) => {
          allChannels.push({
            id: `main_${index}`,
            name: userRequest.youtube_channel_name || 'Main Channel',
            status: 'approved',
            thumbnail: userRequest.youtube_channel_thumbnail || '',
            registration_date: new Date().toISOString(),
            approval_date: new Date().toISOString()
          });
        });
      }

      // Add individual channels from channels table (already filtered by approved status)
      if (channelsData) {
        channelsData.forEach((channel) => {
          allChannels.push({
            id: channel.id,
            name: channel.channel_name || channel.link.split('/').pop() || 'Unknown Channel',
            status: channel.status,
            thumbnail: channel.thumbnail || '',
            registration_date: channel.created_at,
            approval_date: channel.status === 'approved' ? channel.created_at : ''
          });
        });
      }

      // Remove duplicates based on channel name
      const uniqueChannels = allChannels.filter((channel, index, self) => 
        index === self.findIndex(c => c.name === channel.name)
      );

      return {
        success: true,
        channels: uniqueChannels,
        total: uniqueChannels.length,
        message: `Found ${uniqueChannels.length} approved channels for user`
      };

    } catch (error) {
      console.error('Error in fetchUserChannels:', error);
      return {
        success: false,
        channels: [],
        total: 0,
        message: 'Failed to fetch user channels'
      };
    }
  }

  /**
   * Check if a user has access to a specific channel
   */
  async hasChannelAccess(userId: string, channelId: string | number): Promise<boolean> {
    try {
      // Convert channelId to string to ensure startsWith works
      const channelIdStr = String(channelId);
      
      console.log(`🔍 Checking access for user ${userId} to channel ${channelIdStr}`);
      console.log(`🔍 Channel ID type: ${typeof channelId}, value: ${channelId}`);
      console.log(`🔍 Converted to string: ${channelIdStr}`);
      
      // First check if it's a main channel from user_requests
      if (channelIdStr.startsWith('main_')) {
        console.log('📺 Checking main channel access...');
        const { data: userRequest, error } = await supabase
          .from('user_requests')
          .select('youtube_links, status')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('❌ Error checking user request access:', error);
          return false;
        }

        // Only grant access if the user request is approved
        const hasAccess = userRequest?.status === 'approved' && userRequest?.youtube_links && userRequest.youtube_links.length > 0;
        console.log(`📺 Main channel access result: ${hasAccess}`, { status: userRequest?.status, links: userRequest?.youtube_links });
        return hasAccess;
      }

      // For individual channels, check if they belong to the user's request AND are approved
      console.log('🔗 Checking individual channel access...');
      
      // Get the user's request ID first
      const { data: userRequest, error: requestError } = await supabase
        .from('user_requests')
        .select('id, status')
        .eq('user_id', userId)
        .single();

      if (requestError) {
        console.error('❌ Error fetching user request:', requestError);
        return false;
      }

      console.log(`👤 User request ID: ${userRequest.id}, Status: ${userRequest.status}`);

      // Now check if the channel belongs to this user's request AND is approved
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id, status')
        .eq('id', channelId) // Use original channelId for database query
        .eq('main_request_id', userRequest.id)
        .eq('status', 'approved')
        .single();

      if (channelError && channelError.code !== 'PGRST116') {
        console.error('❌ Error checking channel access:', channelError);
        return false;
      }

      const hasAccess = !!channel;
      console.log(`🔗 Individual channel access result: ${hasAccess}`, channel);
      return hasAccess;
    } catch (error) {
      console.error('❌ Error checking channel access:', error);
      return false;
    }
  }

  /**
   * Get channel details for a specific channel ID
   */
  async getChannelDetails(channelId: string | number): Promise<ChannelInfo | null> {
    try {
      const { data: channel, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();

      if (error) {
        console.error('Error fetching channel details:', error);
        return null;
      }

      return {
        id: channel.id,
        name: channel.channel_name || channel.link.split('/').pop() || 'Unknown Channel',
        status: channel.status,
        thumbnail: channel.thumbnail || '',
        registration_date: channel.created_at,
        approval_date: channel.status === 'approved' ? channel.created_at : ''
      };
    } catch (error) {
      console.error('Error getting channel details:', error);
      return null;
    }
  }
}

export const userChannelService = new UserChannelService();
export default userChannelService;
