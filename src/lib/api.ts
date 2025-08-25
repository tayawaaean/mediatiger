// Centralized API configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://18.142.174.87:3000',
  
  // API endpoints
  ENDPOINTS: {
    MUSIC: '/api/music',
    ANALYTICS: '/api/analytics',
    CHANNELS: '/api/channels',
    CHANNEL: '/api/channel',
    DAILY_ANALYTICS: '/api/analytics/daily',
    TEST: '/api/test',
    HEALTH: '/health',
  },
  
  // Proxy endpoints (for Vercel)
  PROXY_ENDPOINTS: {
    MUSIC: '/apis/music',
    ANALYTICS: '/apis/analytics',
    CHANNELS: '/apis/channels',
    CHANNEL: '/apis/channel',
    DAILY_ANALYTICS: '/apis/analytics/daily',
    TEST: '/apis/test',
    HEALTH: '/health',
  },
  
  // CORS configuration
  CORS: {
    credentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // Timeout configuration
  TIMEOUT: 30000, // 30 seconds
};

// Helper function to get the appropriate API URL
export function getApiUrl(endpoint: string, useProxy: boolean = true): string {
  const baseUrl = useProxy ? '' : API_CONFIG.BASE_URL;
  const endpointPath = useProxy 
    ? API_CONFIG.PROXY_ENDPOINTS[endpoint as keyof typeof API_CONFIG.PROXY_ENDPOINTS] || endpoint
    : API_CONFIG.ENDPOINTS[endpoint as keyof typeof API_CONFIG.ENDPOINTS] || endpoint;
  
  return `${baseUrl}${endpointPath}`;
}

// Helper function to get music API URL
export function getMusicApiUrl(): string {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    // In development, use the Vite proxy
    return '/api/music';
  } else {
    // In production, use the new HTTPS server directly
    return import.meta.env.VITE_MUSIC_API_URL || 'https://18.142.174.87:3000/api/music';
  }
}

// Helper function to get analytics API URL
export function getAnalyticsApiUrl(): string {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? '/api/analytics' : getApiUrl('ANALYTICS', true);
}

// Helper function to get channels API URL
export function getChannelsApiUrl(): string {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? '/api/channels' : getApiUrl('CHANNELS', true);
}

// Helper function to get daily analytics API URL
export function getDailyAnalyticsApiUrl(): string {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? '/api/analytics/daily' : getApiUrl('DAILY_ANALYTICS', true);
}

export default API_CONFIG;
