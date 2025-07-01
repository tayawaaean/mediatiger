const axios = require('axios');

module.exports = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });;
    console.log('API handler started');
    console.log('Method:', req.method);

    console.log('Environment check:', {
      hasApiKey: !!process.env.PLAYIST_API_KEY,
      hasApiUrl: !!process.env.PLAYIST_API_URL,
      hasFrontendUrl: !!process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV,
    });

    // Updated CORS headers to include POST
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request handled');
      return res.status(200).end();
    }

    // Accept both GET and POST requests
    // if (req.method !== 'GET' && req.method !== 'POST') {
    //   console.log('Method not allowed:', req.method);
    //   return res.status(405).json({
    //     error: 'Method Not Allowed',
    //     details: 'Only GET and POST requests are supported',
    //   });
    // }

    // Test response
    if (req.query.test === 'true') {
      return res.status(200).json({
        success: true,
        message: 'API is working',
        environment: {
          hasApiKey: !!process.env.PLAYIST_API_KEY,
          hasApiUrl: !!process.env.PLAYIST_API_URL,
        },
      });
    }

    // Handle both GET and POST requests
    // For GET: use query parameters
    // For POST: use request body
    let page, size;
    
    if (req.method === 'GET') {
      page = parseInt(req.query.page) || 1;
      size = parseInt(req.query.size) || 15;
    } else if (req.method === 'POST') {
      const body = req.body || {};
      page = parseInt(body.page) || 1;
      size = parseInt(body.size) || 15;
      console.log('POST request body:', body);
    }

    const apiUrl = process.env.PLAYIST_API_URL || 'https://api.playist.studio/public/v1/music/list';
    const apiKey = process.env.PLAYIST_API_KEY;

    if (!apiKey) {
      console.error('API key not found');
      return res.status(500).json({
        error: 'API key not configured',
        details: 'PLAYIST_API_KEY environment variable is missing',
      });
    }

    console.log('Making API request:', { page, size, apiUrl: apiUrl.substring(0, 50) + '...' });

    const response = await axios.get(apiUrl, {
      headers: {
        'ZS-API-Auth': apiKey,
        'Accept-Language': 'en',
        'User-Agent': 'MediaTiger/1.0.0',
      },
      params: { page, size },
      timeout: 10000,
    });

    console.log('API response status:', response.status);
    console.log('API response success:', response.data.success);

    if (response.data.success && response.data.response_code === 0) {
      const tracks = response.data.datas.map((item) => ({
        id: item.isrc || `track-${Math.random().toString(36).substr(2, 9)}`,
        title: item.name || 'Unknown Title',
        artist: item.artist || 'Unknown Artist',
        cover: item.thumbnail || 'https://via.placeholder.com/100',
        duration: '0:00',
        favorite: false,
        category: item.tags ? item.tags.map((tag) => tag.name.toLowerCase()) : [],
        music: item.music || '',
      }));

      console.log('Successfully processed tracks:', tracks.length);

      res.status(200).json({
        success: true,
        tracks,
        hasMore: response.data.page_data?.next?.length > 0,
        page,
        size,
        total: tracks.length,
      });
    } else {
      console.error('API returned error:', response.data);
      res.status(400).json({
        error: response.data.message || 'Failed to fetch music tracks',
        apiResponseCode: response.data.response_code,
      });
    }
  } catch (error) {
    console.error('Error in API handler:', error);
    console.error('Error stack:', error.stack);

    let message = 'Failed to fetch music from API';
    let statusCode = 500;

    if (error.code === 'MODULE_NOT_FOUND') {
      message = 'Required module not found';
    } else if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
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
    } else if (error.code === 'ENOTFOUND') {
      message = 'Unable to reach external API';
      statusCode = 502;
    }

    res.status(statusCode).json({
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};