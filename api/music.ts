import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface MusicItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  favorite: boolean;
  category: string[];
  music: string;
}

interface ApiResponse {
  success: boolean;
  response_code?: number;
  datas: any[];
  page_data: { next: string[] };
  message?: string;
}

// Changed from module.exports to export default
module.exports = async (req: VercelRequest, res: VercelResponse) => {
  // Debug environment variables
  console.log('Vercel ENV:', process.env);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  try {
    const { page = 1, size = 15 } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    const response = await axios.get<ApiResponse>(process.env.PLAYIST_API_URL || 'https://api.playist.studio/public/v1/music/list', {
      headers: {
        'ZS-API-Auth': process.env.PLAYIST_API_KEY,
        'Accept-Language': 'en',
      },
      params: {
        page,
        size,
      },
    });

    if (response.data.success && response.data.response_code === 0) {
      const tracks: MusicItem[] = response.data.datas.map((item: any) => ({
        id: item.isrc,
        title: item.name,
        artist: item.artist || 'Unknown Artist',
        cover: item.thumbnail || 'https://via.placeholder.com/100',
        duration: '0:00',
        favorite: false,
        category: item.tags ? item.tags.map((tag: any) => tag.name.toLowerCase()) : [],
        music: item.music || '',
      }));

      res.status(200).json({
        success: true,
        tracks,
        hasMore: response.data.page_data.next.length > 0,
      });
    } else {
      res.status(400).json({
        error: response.data.message || 'Failed to fetch music tracks',
      });
    }
  } catch (error) {
    console.error('Error fetching music:', error);
    let message = 'Failed to fetch music from API';
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      message = 'Rate limit exceeded. Please try again later.';
    } else if (axios.isAxiosError(error) && error.response?.status === 403) {
      message = 'Access denied. Check IP whitelisting.';
    }
    res.status(500).json({ error: message });
  }
}