import { supabase } from '../lib/supabase';
import { AnalyticsData, ChannelInfo } from './analyticsService';

type AnalyticsChannel = {
  cid: string;
  cname: string;
  cthumbnail: string | null;
};

type DailyChannelRow = {
  date: string;
  cid: string;
  total_views: number;
  total_premium_views: number;
  total_revenue: number;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeName(name: string | null | undefined): string {
  return (name || '').trim().toLowerCase();
}

class SupabaseAnalyticsService {
  private async findAnalyticsByName(name: string): Promise<AnalyticsChannel | null> {
    const norm = normalizeName(name);
    // 1) try exact case-insensitive match
    let { data: exact } = await supabase
      .from('analytics_channels')
      .select('cid, cname, cthumbnail')
      .ilike('cname', norm);
    if (exact && exact.length > 0) {
      const matched = exact.find(r => normalizeName(r.cname) === norm) || exact[0];
      return { cid: matched.cid, cname: matched.cname, cthumbnail: matched.cthumbnail || null };
    }
    // 2) try contains match
    const pattern = `%${name}%`;
    const { data: contains } = await supabase
      .from('analytics_channels')
      .select('cid, cname, cthumbnail')
      .ilike('cname', pattern);
    if (contains && contains.length > 0) {
      const matched = contains[0];
      return { cid: matched.cid, cname: matched.cname, cthumbnail: matched.cthumbnail || null };
    }
    return null;
  }

  async fetchChannelOptions(userId: string): Promise<{ channels: ChannelInfo[]; nameToCid: Record<string, AnalyticsChannel>; }> {
    type Candidate = { name: string; thumbnail?: string };
    const candidates: Candidate[] = [];

    // 1) Pull from user_requests (source: youtube_channel_name)
    const { data: userRequest } = await supabase
      .from('user_requests')
      .select('id, status, youtube_channel_name, youtube_channel_thumbnail')
      .eq('user_id', userId)
      .single();

    if (userRequest?.status === 'approved' && userRequest?.youtube_channel_name) {
      candidates.push({ name: userRequest.youtube_channel_name, thumbnail: userRequest.youtube_channel_thumbnail || undefined });
    }

    // 2) Pull from channels (source: channel_name, thumbnail)
    if (userRequest?.id) {
      const { data: channelsData } = await supabase
        .from('channels')
        .select('channel_name, thumbnail, status')
        .eq('main_request_id', userRequest.id)
        .eq('status', 'approved');

      (channelsData || []).forEach((ch: any) => {
        if (ch?.channel_name) {
          candidates.push({ name: ch.channel_name, thumbnail: ch.thumbnail || undefined });
        }
      });
    }

    // De-duplicate by normalized name, prefer candidate with thumbnail
    const byName: Record<string, Candidate> = {};
    for (const c of candidates) {
      const key = normalizeName(c.name);
      if (!byName[key] || (!byName[key].thumbnail && c.thumbnail)) {
        byName[key] = c;
      }
    }

    // 3) Map to analytics_channels by cname (treat cname as unique ID by name)
    const nameToCid: Record<string, AnalyticsChannel> = {};
    const channelOptions: ChannelInfo[] = [];

    for (const key of Object.keys(byName)) {
      const cand = byName[key];
      const match = await this.findAnalyticsByName(cand.name);
      if (match) {
        nameToCid[key] = match;
      }
      const thumb = cand.thumbnail || match?.cthumbnail || '';
      const displayName = match?.cname || cand.name;
      channelOptions.push({
        id: displayName,
        name: displayName,
        status: 'approved',
        thumbnail: thumb,
        registration_date: new Date().toISOString(),
        approval_date: new Date().toISOString(),
      });
    }

    // Final unique options by display name
    const uniqueOptions = channelOptions.filter((c, idx, arr) => idx === arr.findIndex(x => x.name === c.name));

    return { channels: uniqueOptions, nameToCid };
  }

  async fetchAnalyticsRangeForUser(
    userId: string,
    startDate: Date,
    endDate: Date,
    selectedAnalyticsName?: string
  ): Promise<AnalyticsData> {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    // Build mapping and select which cids to query
    const { nameToCid } = await this.fetchChannelOptions(userId);

    let cidsToQuery: string[] = Object.values(nameToCid).map(v => v.cid);
    let channelLabel = 'all';

    if (selectedAnalyticsName && selectedAnalyticsName !== 'all') {
      const key = normalizeName(selectedAnalyticsName);
      let entry = nameToCid[key];
      if (!entry) {
        // Last-chance fuzzy lookup directly
        entry = await this.findAnalyticsByName(selectedAnalyticsName) as any;
      }
      if (entry) {
        cidsToQuery = [entry.cid];
        channelLabel = entry.cname;
      } else {
        return this.emptyResult(startDate, endDate, selectedAnalyticsName);
      }
    }

    if (cidsToQuery.length === 0) {
      return this.emptyResult(startDate, endDate, 'none');
    }

    const { data: rows, error } = await supabase
      .from('daily_channel_analytics')
      .select('date, cid, total_views, total_premium_views, total_revenue')
      .gte('date', start)
      .lte('date', end)
      .in('cid', cidsToQuery)
      .order('date', { ascending: true });

    if (error) {
      // Return empty on error but keep shape
      return this.emptyResult(startDate, endDate, channelLabel);
    }

    // Build daily timeline between start and end
    const dailyIndex: Record<string, { views: number; premium: number; revenue: number; }> = {};
    (rows as DailyChannelRow[] || []).forEach(r => {
      if (!dailyIndex[r.date]) {
        dailyIndex[r.date] = { views: 0, premium: 0, revenue: 0 };
      }
      dailyIndex[r.date].views += r.total_views || 0;
      dailyIndex[r.date].premium += r.total_premium_views || 0;
      dailyIndex[r.date].revenue += Number(r.total_revenue || 0);
    });

    const dailyData: AnalyticsData['dailyData'] = [];
    const cursor = new Date(startDate);
    const endCursor = new Date(endDate);
    while (cursor.getTime() <= endCursor.getTime()) {
      const ds = formatDate(cursor);
      const bucket = dailyIndex[ds] || { views: 0, premium: 0, revenue: 0 };
      const rpm = bucket.views > 0 ? (bucket.revenue / bucket.views) * 1000 : 0;
      const premiumRpm = bucket.premium > 0 ? (bucket.revenue / bucket.premium) * 1000 : 0;
      dailyData.push({
        date: ds,
        views: bucket.views,
        premiumViews: bucket.premium,
        rpm: Math.round(rpm * 1000) / 1000,
        premiumRpm: Math.round(premiumRpm * 1000) / 1000,
        revenue: Math.round(bucket.revenue * 100) / 100,
        hasData: bucket.views > 0 || bucket.premium > 0 || bucket.revenue > 0,
        dataSize: bucket.views,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const totalViews = dailyData.reduce((s, d) => s + d.views, 0);
    const totalPremiumViews = dailyData.reduce((s, d) => s + d.premiumViews, 0);
    const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0);
    const averageRPM = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0;
    const premiumRPM = totalPremiumViews > 0 ? (totalRevenue / totalPremiumViews) * 1000 : 0;

    return {
      success: true,
      dateRange: {
        start,
        end,
        days: dailyData.length,
        startFormatted: new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        endFormatted: new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      channel: channelLabel,
      dailyData,
      summary: {
        totalViews,
        totalPremiumViews,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageRPM: Math.round(averageRPM * 1000) / 1000,
        premiumRPM: Math.round(premiumRPM * 1000) / 1000,
        dataPoints: dailyData.length,
        dataAvailability: 100,
        errors: 0,
        successRate: 100,
      },
      status: 'completed',
      progress: 100,
      notice: 'Data fetched directly from Supabase',
      implementation: 'supabase-direct',
    };
  }

  private emptyResult(startDate: Date, endDate: Date, channel: string): AnalyticsData {
    return {
      success: true,
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate),
        days: Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        startFormatted: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        endFormatted: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      channel,
      dailyData: [],
      summary: {
        totalViews: 0,
        totalPremiumViews: 0,
        totalRevenue: 0,
        averageRPM: 0,
        dataPoints: 0,
        dataAvailability: 0,
        errors: 0,
        successRate: 100,
      },
      status: 'completed',
      progress: 100,
      notice: 'No data available for selection',
      implementation: 'supabase-direct',
    };
  }
}

export const supabaseAnalyticsService = new SupabaseAnalyticsService();
export default supabaseAnalyticsService;

// Fetch per-video analytics for a user selection and date range
export async function fetchVideoAnalyticsRangeForUser(
  userId: string,
  startDate: Date,
  endDate: Date,
  selectedAnalyticsName?: string
): Promise<Array<{ id: string; title: string; thumbnail?: string; rpmGross: number; revenueGross: number; views: number }>> {
  const service = new SupabaseAnalyticsService();
  const { nameToCid } = await service.fetchChannelOptions(userId);

  let cidsToQuery: string[] = Object.values(nameToCid).map(v => v.cid);
  if (selectedAnalyticsName && selectedAnalyticsName !== 'all') {
    const key = (selectedAnalyticsName || '').trim().toLowerCase();
    let entry = nameToCid[key];
    if (!entry) {
      entry = await (service as any).findAnalyticsByName(selectedAnalyticsName);
    }
    if (entry) {
      cidsToQuery = [entry.cid];
    } else {
      return [];
    }
  }

  if (cidsToQuery.length === 0) return [];

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  const { data: rows, error } = await supabase
    .from('daily_video_analytics')
    .select('date, cid, vid, total_views, total_revenue, analytics_videos(vid, vname, vthumbnail)')
    .gte('date', start)
    .lte('date', end)
    .in('cid', cidsToQuery);

  if (error) return [];

  type Row = {
    date: string; cid: string; vid: string;
    total_views: number; total_revenue: number;
    analytics_videos?: { vid: string; vname: string; vthumbnail?: string } | null;
  };

  const byVid: Record<string, { title: string; thumb?: string; revenue: number; views: number }>
    = {};

  (rows as Row[] || []).forEach(r => {
    const key = r.vid;
    const title = r.analytics_videos?.vname || r.vid;
    const thumb = r.analytics_videos?.vthumbnail || undefined;
    if (!byVid[key]) byVid[key] = { title, thumb, revenue: 0, views: 0 };
    byVid[key].revenue += Number(r.total_revenue || 0);
    byVid[key].views += Number(r.total_views || 0);
    // Keep latest non-empty title/thumb
    if (!byVid[key].thumb && thumb) byVid[key].thumb = thumb;
    if (title && byVid[key].title === r.vid) byVid[key].title = title;
  });

  const result = Object.entries(byVid).map(([vid, v]) => {
    const rpm = v.views > 0 ? (v.revenue / v.views) * 1000 : 0;
    return {
      id: vid,
      title: v.title,
      thumbnail: v.thumb,
      rpmGross: Math.round(rpm * 1000) / 1000,
      revenueGross: Math.round(v.revenue * 100) / 100,
      views: v.views,
    };
  });

  // Sort by views desc
  result.sort((a, b) => b.views - a.views);
  return result;
}


