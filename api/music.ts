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

// Export as default function for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Debug environment variables
  console.log('Environment check:', {
    hasApiKey: !!process.env.PLAYIST_API_KEY,
    hasApiUrl: !!process.env.PLAYIST_API_URL,
    hasFrontendUrl: !!process.env.FRONTEND_URL
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  try {
    // Handle both GET and POST requests
    let page = 1;
    let size = 15;

    if (req.method === 'GET') {
      page = parseInt(req.query.page as string) || 1;
      size = parseInt(req.query.size as string) || 15;
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      page = body.page || 1;
      size = body.size || 15;
    }

    const apiUrl = process.env.PLAYIST_API_URL || 'https://api.playist.studio/public/v1/music/list';
    const apiKey = process.env.PLAYIST_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured' 
      });
    }

    console.log('Making API request:', { page, size, apiUrl });

    const response = await axios.get<ApiResponse>(apiUrl, {
      headers: {
        'ZS-API-Auth': apiKey,
        'Accept-Language': 'en',
      },
      params: {
        page,
        size,
      },
    });

    console.log('API response status:', response.status);
    console.log('API response success:', response.data.success);

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
        page,
        size,
        total: tracks.length
      });
    } else {
      console.error('API returned error:', response.data);
      res.status(400).json({
        error: response.data.message || 'Failed to fetch music tracks',
      });
    }
  } catch (error) {
    console.error('Error fetching music:', error);
    let message = 'Failed to fetch music from API';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      if (error.response?.status === 429) {
        message = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (error.response?.status === 403) {
        message = 'Access denied. Check IP whitelisting.';
        statusCode = 403;
      } else if (error.response?.status === 401) {
        message = 'Invalid API key or authentication failed.';
        statusCode = 401;
      }
    }

    res.status(statusCode).json({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}