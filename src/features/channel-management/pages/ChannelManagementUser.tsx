import {
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  XCircle,
  Youtube,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import NewChannelPopup from '../components/AddNewChannel';
import { Tooltip } from '../../../components/Tooltip';
import { useLanguage } from '../../../contexts/LanguageContext';
import { AffiliateProgram } from '../../../components/refferalMusic/AffiliateProgram';
import FadeInUp from '../../../components/FadeInUp';
interface Channel {
  url: string;
  views: number;
  monthlyViews: number;
  subscribers: number;
  growth: number;
  status?: string;
  profileImage?: string;
  title?: string;
}

export default function ChannelManagement() {
  const { user } = useAuth();
  const [selectedChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const { translate } = useLanguage();

  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const getChannelInfo = async (url: string) => {
    const handle = url.split('youtube.com/@')[1]?.split('/')[0];

    if (!handle) return { title: 'Unknown', profileImage: '', channelId: '' };

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=@${handle}&key=${YOUTUBE_API_KEY}`
    );

    const data = await res.json();
    const snippet = data?.items?.[0]?.snippet;
    const channelId = data?.items?.[0]?.id?.channelId;

    return {
      channelId: channelId || '',
      profileImage: snippet?.thumbnails?.high?.url || '',
      title: snippet?.title || 'Unknown',
    };
  };

  const fetchChannels = async () => {
    try {
      setIsLoading(true);

      const { data: requestData, error: requestError } = await supabase
        .from('user_requests')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (requestError) throw requestError;

      const youtubeLinks = requestData?.youtube_links || [];
      if (youtubeLinks.length === 0) {
        setError(translate('channels.noChannelsLinked'));
        setIsLoading(false);
        return;
      }

      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', user?.id);

      if (channelsError) throw channelsError;

      const { data: viewsData, error: viewsError } = await supabase
        .from('channel_views')
        .select('*')
        .eq('user_id', user?.id)
        .order('month', { ascending: false });

      if (viewsError) throw viewsError;

      const mainChannel = await Promise.all(
        youtubeLinks.map(async (url: string) => {
          const { profileImage, title } = await getChannelInfo(url);

          const channelViews =
            viewsData?.filter((v) => v.channel_id === url) || [];
          const currentMonthViews = channelViews[0]?.views || 0;
          const lastMonthViews = channelViews[1]?.views || 0;
          const growth = lastMonthViews
            ? ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100
            : 0;

          return {
            url,
            views: channelViews.reduce((sum, v) => sum + v.views, 0),
            monthlyViews: currentMonthViews,
            subscribers: Math.floor(Math.random() * 1000000),
            growth,
            status: 'approved',
            profileImage,
            title,
          };
        })
      );

      interface ChannelData {
        link: string;
        status: string;
      }

      const otherChannels = (channelsData || []).map((data: ChannelData) => {
        const url = data?.link;
        const channelViews =
          viewsData?.filter((v) => v.channel_id === url) || [];
        const currentMonthViews = channelViews[0]?.views || 0;
        const lastMonthViews = channelViews[1]?.views || 0;
        const growth = lastMonthViews
          ? ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100
          : 0;
        return {
          url,
          views: channelViews.reduce((sum, v) => sum + v.views, 0),
          monthlyViews: currentMonthViews,
          subscribers: Math.floor(Math.random() * 1000000),
          growth,
          status: data.status,
        };
      });

      setChannels([...mainChannel, ...otherChannels]);
      setError(null);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError(translate('channels.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ChannelManagement] useEffect triggered');
    if (user === undefined) {
      return;
    }
    if (!user) {
      setIsLoading(false);
      return;
    }
    console.log('[ChannelManagement] User ID:', user);
    fetchChannels();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-300">
            {translate('channels.loadingChannels')}
          </p>
        </div>
      </div>
    );
  }

  if (error && channels.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        {showAddChannelModal && (
          <NewChannelPopup
            loadChannels={fetchChannels}
            type="main"
            isOpen={showAddChannelModal}
            onClose={() => {
              setShowAddChannelModal(false);
            }}
            userEmail={user?.email || ''}
            userId={user?.id || ''}
          />
        )}
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Youtube className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{error}</h3>
          <p className="text-slate-400 mb-6">
            {translate('channels.linkYourChannels')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                fetchChannels();
              }}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors inline-flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {translate('common.refresh')}
            </button>
            <button
              onClick={() => setShowAddChannelModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              {translate('channels.addChannel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <FadeInUp>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            {/* Channels List Section */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div id="channels-channel-view">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {translate('channels.yourChannels')}
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      onClick={() => {
                        setIsLoading(true);
                        fetchChannels();
                      }}
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
                      onClick={() => setShowAddChannelModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {translate('channels.addChannel')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {channels.map((channel) => (
                    <button
                      key={channel.url}
                      onClick={() => {
                        window.open(channel.url, '_blank');
                      }}
                      className={`p-4 rounded-xl transition-all duration-300 text-left ${
                        selectedChannel?.url === channel.url
                          ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20'
                          : 'border border-slate-700/50 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                          <img
                            src={channel.profileImage}
                            alt="channel avatar"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <div className="flex items-center space-x-1">
                            {channel.status == 'pending' && (
                              <Tooltip
                                content={translate('channels.pendingApproval')}
                              >
                                <Clock className="h-4 w-4 text-yellow-300" />
                              </Tooltip>
                            )}
                            {channel.status == 'approved' && (
                              <Tooltip content={translate('channels.approved')}>
                                <CheckCircle className="h-4 w-4 text-green-300" />
                              </Tooltip>
                            )}
                            {channel.status == 'rejected' && (
                              <Tooltip content={translate('channels.rejected')}>
                                <XCircle className="h-4 w-4 text-red-300" />
                              </Tooltip>
                            )}
                            <span className="text-white font-medium truncate">
                              {channel.title}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {channel.monthlyViews.toLocaleString()}{' '}
                            {translate('channels.viewsThisMonth')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider"></div>
              <AffiliateProgram />
            </div>

            {/* Status messages */}
            {selectedChannel?.status === 'pending' ? (
              <div className="bg-slate-800 rounded-xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {translate('channels.channelPendingApproval')}
                </h3>
                <p className="text-slate-400 mb-6">
                  {translate('channels.channelUnderReview')}
                </p>
                <div className="flex justify-center">
                  <a
                    href={selectedChannel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center"
                  >
                    {translate('channels.viewChannel')}{' '}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            ) : selectedChannel?.status === 'rejected' ? (
              <div className="bg-slate-800 rounded-xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {translate('channels.channelNotApproved')}
                </h3>
                <p className="text-slate-400 mb-6">
                  {translate('channels.channelRequirements')}
                </p>
                <div className="flex flex-col items-center gap-4">
                  <a
                    href={selectedChannel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-400 hover:text-red-300 flex items-center"
                  >
                    {translate('channels.viewChannel')}{' '}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                  <button
                    onClick={() => setShowAddChannelModal(true)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {translate('channels.tryAnotherChannel')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Add Channel Modal */}
        {showAddChannelModal && (
          <NewChannelPopup
            isOpen={showAddChannelModal}
            onClose={() => {
              setShowAddChannelModal(false);
            }}
            userEmail={user?.email || ''}
            userId={user?.id || ''}
            loadChannels={fetchChannels}
          />
        )}
      </FadeInUp>
    </div>
  );
}
