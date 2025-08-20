const https = require('https');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const AdmZip = require('adm-zip'); 

dotenv.config({ path: '/home/ubuntu/backend/.env' });

// Override PORT to 3001 to avoid conflicts
process.env.PORT = '3001';

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const PLAYIST_ENDPOINTS = {
  MUSIC_LIST: '/public/v1/music/list',
  REPORTING_DAILY: '/public/v1/reporting/daily',
  CHANNEL_LIST: '/public/v1/channel/list'
};

const { PLAYIST_API_URL, PLAYIST_API_KEY, FRONTEND_URL, PORT } = process.env;

console.log('Loaded ENV:', {
  PLAYIST_API_URL: PLAYIST_API_URL || 'Not set',
  PLAYIST_API_KEY: PLAYIST_API_KEY ? 'Set (length: ' + PLAYIST_API_KEY.length + ')' : 'Not set',
  FRONTEND_URL: FRONTEND_URL || 'Not set',
  PORT: process.env.PORT,
});

const app = express();
app.use(cors());
app.use(express.json());

const CACHE_TTL = 60 * 60 * 1000;
const apiCallTimestamps = new Map();
const API_RATE_LIMIT_MS = 1000; // Base rate limit: 1 request per second
const rateLimitBackoff = new Map();
const apiCache = new Map();
const searchSessions = new Map();

/**
 * 🚦 ENHANCED THROTTLING CONFIGURATION
 * 
 * This system provides multiple layers of throttling:
 * 
 * 1. ENDPOINT-BASED RATE LIMITING:
 *    - analytics: 10 requests/minute (for single date queries)
 *    - music: 20 requests/minute (for music list queries)
 *    - channels: 15 requests/minute (for channel queries)
 *    - range: 5 requests/minute (for intensive date range queries)
 * 
 * 2. ADAPTIVE THROTTLING:
 *    - Automatically adjusts delays based on API responses
 *    - Exponential backoff when hitting rate limits
 *    - Gradual recovery to normal speed
 * 
 * 3. QUEUE MANAGEMENT:
 *    - Prioritizes requests (1=high, 2=medium, 3=low)
 *    - Limits concurrent requests to avoid overwhelming APIs
 *    - Automatic retry with lower priority on failures
 * 
 * 4. INTELLIGENT DELAYS:
 *    - Range queries: 3x slower (more intensive)
 *    - Analytics: 2x slower (medium intensity)
 *    - Others: Normal speed
 */
const THROTTLING_CONFIG = {
  // Rate limits per endpoint
  endpoints: {
    'analytics': { requests: 10, window: 60000 }, // 10 requests per minute
    'music': { requests: 20, window: 60000 },     // 20 requests per minute
    'channels': { requests: 15, window: 60000 },  // 15 requests per minute
    'range': { requests: 5, window: 60000 }       // 5 requests per minute (more intensive)
  },
  
  // Adaptive throttling
  adaptive: {
    enabled: true,
    baseDelay: 1000,        // Base delay in ms
    maxDelay: 30000,        // Maximum delay in ms
    backoffMultiplier: 2,   // Exponential backoff multiplier
    recoveryTime: 300000    // Time to recover to base delay (5 minutes)
  },
  
  // Queue management
  queue: {
    maxConcurrent: 3,       // Maximum concurrent requests
    maxQueueSize: 100,      // Maximum items in queue
    priorityLevels: 3       // Number of priority levels (1=high, 2=medium, 3=low)
  }
};

// Request queue for throttling
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = new Set();
    this.endpointCounters = new Map();
    this.lastReset = Date.now();
  }

  // Add request to queue
  async enqueue(endpoint, requestFn, priority = 2) {
    return new Promise((resolve, reject) => {
      const request = {
        id: Date.now() + Math.random(),
        endpoint,
        requestFn,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      };

      // Insert based on priority (1=high, 2=medium, 3=low)
      const insertIndex = this.queue.findIndex(item => item.priority > priority);
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      // Process queue if not already processing
      if (this.processing.size < THROTTLING_CONFIG.queue.maxConcurrent) {
        this.processQueue();
      }
    });
  }

  // Process queued requests
  async processQueue() {
    if (this.queue.length === 0 || this.processing.size >= THROTTLING_CONFIG.queue.maxConcurrent) {
      return;
    }

    // Reset counters if window has passed
    const now = Date.now();
    if (now - this.lastReset > 60000) { // 1 minute window
      this.endpointCounters.clear();
      this.lastReset = now;
    }

    // Get next request
    const request = this.queue.shift();
    if (!request) return;

    // Check rate limit for this endpoint
    const endpointConfig = THROTTLING_CONFIG.endpoints[request.endpoint];
    if (endpointConfig) {
      const currentCount = this.endpointCounters.get(request.endpoint) || 0;
      if (currentCount >= endpointConfig.requests) {
        // Rate limit hit, put back in queue with lower priority
        request.priority = Math.min(request.priority + 1, THROTTLING_CONFIG.queue.priorityLevels);
        this.queue.unshift(request);
        
        // Wait for next window
        setTimeout(() => this.processQueue(), endpointConfig.window);
        return;
      }
      
      // Increment counter
      this.endpointCounters.set(request.endpoint, currentCount + 1);
    }

    // Process request
    this.processing.add(request.id);
    
    try {
      const result = await request.requestFn();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.processing.delete(request.id);
      
      // Add delay based on endpoint
      const delay = this.calculateDelay(request.endpoint);
      setTimeout(() => this.processQueue(), delay);
    }
  }

  // Calculate delay for endpoint
  calculateDelay(endpoint) {
    const baseDelay = THROTTLING_CONFIG.adaptive.baseDelay;
    
    switch (endpoint) {
      case 'range':
        return baseDelay * 3; // Slower for intensive operations
      case 'analytics':
        return baseDelay * 2; // Medium speed
      default:
        return baseDelay; // Normal speed
    }
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      maxConcurrent: THROTTLING_CONFIG.queue.maxConcurrent,
      endpointCounters: Object.fromEntries(this.endpointCounters)
    };
  }
}

const requestQueue = new RequestQueue();

// Cleanup old sessions and cache entries
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, session] of searchSessions.entries()) {
    if (session.lastAccessed < fiveMinutesAgo) {
      searchSessions.delete(key);
    }
  }
  for (const [key, timestamp] of apiCallTimestamps.entries()) {
    if (timestamp < fiveMinutesAgo) {
      apiCallTimestamps.delete(key);
    }
  }
  for (const [key, cacheEntry] of apiCache.entries()) {
    if (cacheEntry.timestamp < fiveMinutesAgo) {
      apiCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

const getCachedResponse = (cacheKey) => {
  const cached = apiCache.get(cacheKey);
  return cached && Date.now() - cached.timestamp < CACHE_TTL ? cached.data : null;
};

const setCacheResponse = (cacheKey, data) => {
  apiCache.set(cacheKey, { data, timestamp: Date.now() });
};

// Enhanced rate limiting with adaptive throttling
const rateLimitedApiCall = async (key, apiCallFunction, retryCount = 0, endpoint = 'default') => {
  const lastCall = apiCallTimestamps.get(key) || 0;
  const now = Date.now();
  const timeSinceLastCall = now - lastCall;
  const currentBackoff = rateLimitBackoff.get(key) || API_RATE_LIMIT_MS;
  
  // Use queue-based throttling for better control
  if (THROTTLING_CONFIG.adaptive.enabled) {
    return requestQueue.enqueue(endpoint, apiCallFunction, 2);
  }
  
  // Fallback to old method
  if (timeSinceLastCall < currentBackoff) {
    await new Promise(resolve => setTimeout(resolve, currentBackoff - timeSinceLastCall));
  }
  
  apiCallTimestamps.set(key, Date.now());
  
  try {
    const result = await apiCallFunction();
    rateLimitBackoff.set(key, API_RATE_LIMIT_MS);
    return result;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      const newBackoff = Math.min(currentBackoff * 2, THROTTLING_CONFIG.adaptive.maxDelay);
      rateLimitBackoff.set(key, newBackoff);
      await new Promise(resolve => setTimeout(resolve, newBackoff));
      return rateLimitedApiCall(key, apiCallFunction, retryCount + 1, endpoint);
    }
    throw error;
  }
};

// Throttling middleware for Express routes
const throttlingMiddleware = (endpoint) => {
  return async (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const rateLimitKey = `${endpoint}-${clientIp}`;
    
    try {
      // Check if we're at rate limit
      const endpointConfig = THROTTLING_CONFIG.endpoints[endpoint];
      if (endpointConfig) {
        const currentCount = requestQueue.endpointCounters.get(endpoint) || 0;
        if (currentCount >= endpointConfig.requests) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            details: `Too many requests to ${endpoint} endpoint`,
            retryAfter: Math.ceil(endpointConfig.window / 1000),
            queueStatus: requestQueue.getStatus()
          });
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Generate sample analytics data
const generateSampleAnalyticsData = (date) => {
  const views = 1500000 + Math.floor(Math.random() * 1000000);
  const premiumViews = Math.floor(views * 0.11);
  const rpm = 0.10 + Math.random() * 0.05;
  const revenue = (views * rpm) / 1000;
  
  return {
    success: true,
    kpis: {
      totalViews: Math.round(views),
      premiumViews: Math.round(premiumViews),
      rpm: Math.round(rpm * 100) / 100,
      expectedRevenue: Math.round(revenue * 100) / 100
    },
    revenueAnalysis: [{
      date: date,
      views: views,
      premium_views: premiumViews,
      revenue: Math.round(revenue * 100) / 100,
      rpm: Math.round(rpm * 100) / 100
    }],
    viewershipAnalysis: [],
    isSampleData: true,
    notice: 'Displaying sample data due to API rate limits or unavailability.'
  };
};

// Generate sample channel analytics data
const generateChannelAnalyticsData = (channel, date) => {
  const totalViews = Math.floor(Math.random() * 1000000) + 500000;
  const premiumViews = Math.floor(totalViews * 0.11);
  const rpm = (Math.random() * 0.1 + 0.05).toFixed(3);
  const revenue = (totalViews * rpm / 1000).toFixed(2);
  
  return {
    success: true,
    channel: channel,
    date: date,
    data: {
      totalViews: totalViews,
      premiumViews: premiumViews,
      rpm: rpm,
      revenue: revenue
    },
    isSampleData: true,
    notice: 'Displaying sample data due to API rate limits or unavailability.'
  };
};

// CORS middleware
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Music API endpoint
app.post('/api/music', async (req, res) => {
  const { page = 1, size = 15, search, mood } = req.body || {};

  if (!PLAYIST_API_URL || !PLAYIST_API_KEY) {
    return res.status(500).json({
      error: 'Server configuration error: Missing Playist API credentials.',
    });
  }

  try {
    const cacheKey = `music-list-page:${page}-size:${size}`;
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      return res.status(200).json({
        success: true,
        tracks: cachedResponse.datas || [],
        hasMore: cachedResponse.page_data?.next?.length > 0,
      });
    }
    
    const musicListUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.MUSIC_LIST}`;
    const response = await axios.get(musicListUrl, {
  headers: {
        'ZS-API-Auth': PLAYIST_API_KEY,
        'Accept-Language': 'en',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Lightsail-Proxy/1.0',
      },
      params: { page: page - 1, size },
      timeout: 10000,
    });

    if (response.data.success && response.data.response_code === 0) {
      setCacheResponse(cacheKey, response.data);
      return res.status(200).json({
        success: true,
        tracks: response.data.datas || [],
        hasMore: response.data.page_data?.next?.length > 0,
      });
    }

    return res.status(400).json({
      error: response.data.message || 'Failed to fetch music tracks from Playist',
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || {};

    let message = 'Failed to fetch music from Playist';
    if (status === 401) message = 'Unauthorized: Invalid API key or IP not whitelisted';
    else if (status === 403) message = 'Access denied: IP may not be whitelisted';
    else if (status === 429) message = 'Rate limit exceeded. Please try again later';
    else if (status === 504 || error.code === 'ECONNABORTED') message = 'Timeout: Playist API unreachable';
    else if (error.code === 'ECONNREFUSED') message = 'Connection refused: Playist API down or misconfigured';
    
    return res.status(status).json({
      error: message,
      details: errorData.message || error.message,
    });
  }
});

// Enhanced analytics endpoint with better date handling
app.get('/api/analytics', async (req, res) => {
  try {
    const { date, format } = req.query;
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    const targetDate = date || defaultDate;
    
    // Enhanced date validation
    const targetDateObj = new Date(targetDate);
    if (isNaN(targetDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        details: 'Date must be in YYYY-MM-DD format (e.g., 2024-12-16)',
        examples: [
          '2024-12-16 (today)',
          '2024-12-10 (last week)',
          '2024-08-15 (custom date)'
        ],
        requestedDate: targetDate
      });
    }
    
    if (targetDateObj > today) {
      return res.status(400).json({
        success: false,
        error: 'Future date not supported',
        details: 'Analytics data is only available for past dates. Future dates are not supported.',
        requestedDate: targetDate,
        suggestions: [
          `Use ${today.toISOString().split('T')[0]} for today's data`,
          'Use any past date in YYYY-MM-DD format'
        ]
      });
    }
    
    const cacheKey = `analytics:${targetDate}`;
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const rateLimitKey = `analytics-dashboard-${clientIp}`;
    
    try {
      await rateLimitedApiCall(rateLimitKey, async () => Promise.resolve());
    } catch (rateLimitError) {
      return res.status(200).json(generateSampleAnalyticsData(targetDate));
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const reportingUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.REPORTING_DAILY}`;
      
      // Request ZIP file with arraybuffer response type
      const response = await axios.get(reportingUrl, {
  headers: {
          'ZS-API-Auth': PLAYIST_API_KEY,
          'Accept-Language': 'en',
          'Accept': 'application/zip, application/octet-stream',
          'User-Agent': 'Analytics-Dashboard/1.0',
        },
        params: { 
          date: targetDate
        },
        responseType: 'arraybuffer', // Important: Get binary data
        validateStatus: () => true,
      });

      if (response.status === 200 && response.data) {
        try {
          // Parse ZIP file
          const zip = new AdmZip(response.data);
          const zipEntries = zip.getEntries();
          
          // Extract CSV data
          const csvData = {};
          let totalViews = 0;
          let totalPremiumViews = 0;
          let totalRevenue = 0;
          let channelData = [];
          let videoData = [];
          let musicData = [];
          
          for (const entry of zipEntries) {
            if (entry.entryName.endsWith('.csv')) {
              const csvContent = entry.getData().toString('utf8');
              const lines = csvContent.split('\n').filter(line => line.trim());
              
              if (lines.length > 1) { // Has data beyond header
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                // Debug: Log headers to see actual column names
                console.log(`CSV Headers for ${entry.entryName}:`, headers);
                
                // Parse data rows
                for (let i = 1; i < lines.length; i++) {
                  const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                  const row = {};
                  
                  headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                  });
                  
                  // Calculate totals from data.csv - handle different possible column name variations
                  if (entry.entryName === 'data.csv') {
                    // Try different possible column name variations for top-level columns
                    const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                    const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                    const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                    
                    // NEW: Parse the Analytics JSON column for nested view data
                    let analyticsViews = 0;
                    let analyticsPremiumViews = 0;
                    let analyticsRevenue = 0;
                    
                    if (row['Analytics'] || row['analytics']) {
                      try {
                        const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                        if (Array.isArray(analyticsData)) {
                          // Sum up views from all countries in the Analytics array
                          analyticsData.forEach(countryData => {
                            if (Array.isArray(countryData)) {
                              countryData.forEach(item => {
                                analyticsViews += parseInt(item.views || 0) || 0;
                                analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                              });
                            } else if (typeof countryData === 'object') {
                              // Direct object format
                              analyticsViews += parseInt(countryData.views || 0) || 0;
                              analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                              analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                            }
                          });
                        }
                      } catch (jsonError) {
                        console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                      }
                    }
                    
                    // Use the highest value between top-level and analytics data
                    const finalViews = Math.max(views, analyticsViews);
                    const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                    const finalRevenue = Math.max(revenue, analyticsRevenue);
                    
                    // Debug: Log each row's data
                    console.log(`Row ${i} data:`, { 
                      topLevel: { views, premiumViews, revenue },
                      analytics: { analyticsViews, analyticsPremiumViews, analyticsRevenue },
                      final: { finalViews, finalPremiumViews, finalRevenue },
                      row 
                    });
                    
                    totalViews += finalViews;
                    totalPremiumViews += finalPremiumViews;
                    totalRevenue += finalRevenue;
                  }
                  
                  // Store data by file type
                  if (entry.entryName === 'channel.csv') {
                    channelData.push(row);
                  } else if (entry.entryName === 'video.csv') {
                    videoData.push(row);
                  } else if (entry.entryName === 'music.csv') {
                    musicData.push(row);
                  }
                }
                
                csvData[entry.entryName] = {
                  headers: headers,
                  rows: lines.length - 1,
                  sampleData: lines.slice(1, 3), // First 2 data rows for preview
                  rawContent: csvContent.substring(0, 500) // First 500 chars for debugging
                };
              }
            }
          }
          
          // Debug: Log final totals
          console.log(`Final totals for ${targetDate}:`, { totalViews, totalPremiumViews, totalRevenue });
          
          const rpm = totalViews > 0 ? (totalRevenue * 1000) / totalViews : 0;
          
          const successResponse = {
            success: true,
            date: targetDate,
            dateInfo: {
              requested: targetDate,
              formatted: targetDateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              isToday: targetDate === today.toISOString().split('T')[0],
              isCurrent: targetDate === today.toISOString().split('T')[0]
            },
            kpis: {
              totalViews: totalViews,
              premiumViews: totalPremiumViews,
              rpm: Math.round(rpm * 100) / 100,
              expectedRevenue: Math.round(totalRevenue * 100) / 100
            },
            csvFiles: Object.keys(csvData),
            csvData: csvData,
            channelCount: channelData.length,
            videoCount: videoData.length,
            musicCount: musicData.length,
            rawDataSize: response.data.length,
            isZIPData: true,
            notice: totalViews === 0 ? 'No data available for this date' : 'Data extracted from ZIP file successfully',
            dateSuggestions: totalViews === 0 ? [
              'Try today: ' + today.toISOString().split('T')[0],
              'Try last week: ' + new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              'Try last month: ' + new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            ] : []
          };
          
          setCacheResponse(cacheKey, successResponse);
          return res.status(200).json(successResponse);
          
        } catch (zipError) {
          console.error('Error parsing ZIP:', zipError);
          return res.status(200).json(generateSampleAnalyticsData(targetDate));
        }
      }

      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed with Playist Studio API. Please check your API credentials.',
          details: 'Unable to access reporting endpoint',
          suggestion: 'Verify your API key is valid and your IP is whitelisted'
        });
      }

      if (response.data?.response_code === 2) {
        const sampleResponse = generateSampleAnalyticsData(targetDate);
        setCacheResponse(cacheKey, sampleResponse);
        return res.status(200).json(sampleResponse);
      }
      
      return res.status(response.status).json({
        success: false,
        error: `API request failed with status ${response.status}`,
        details: response.data?.message || 'Unknown error',
        rawResponse: response.data,
        debug: { requestedDate: targetDate, url: reportingUrl }
      });
  } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: 60
          });
        }
        const statusCode = error.response?.status || 500;
        const errorData = error.response?.data || {};
        return res.status(statusCode).json({
          success: false,
          error: 'Failed to fetch analytics data',
          details: errorData.message || error.message,
          statusCode
        });
    } else {
        return res.status(500).json({ 
          success: false,
          error: 'Internal server error while fetching analytics data',
          details: error.message
        });
      }
    }
  } catch (outerError) {
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error in analytics endpoint',
      details: outerError.message
    });
  }
});

// New endpoint for date range analytics
app.get('/api/analytics/range', async (req, res) => {
  try {
    const { start_date, end_date, channel, format = 'summary', batch_size = 'auto' } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing date parameters',
        details: 'Both start_date and end_date are required',
        format: 'YYYY-MM-DD',
        examples: [
          'start_date=2024-12-01&end_date=2024-12-07',
          'start_date=2024-08-01&end_date=2024-08-18'
        ],
        batch_options: [
          'batch_size=auto (recommended)',
          'batch_size=7 (weekly chunks)',
          'batch_size=30 (monthly chunks)'
        ]
      });
    }
    
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    
    // Date validation
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        details: 'Dates must be in YYYY-MM-DD format',
        examples: ['2024-12-01', '2024-08-15']
      });
    }
    
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        details: 'start_date must be before or equal to end_date',
        received: { start_date, end_date }
      });
    }
    
    if (endDate > today) {
      return res.status(400).json({
        success: false,
        error: 'Future dates not supported',
        details: 'End date cannot be in the future',
        suggestion: 'Use dates up to today'
      });
    }
    
    // Calculate date range
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Determine batch size for processing
    let batchSize = 7; // Default to weekly chunks
    if (batch_size === 'auto') {
      if (days <= 7) batchSize = days; // No batching for small ranges
      else if (days <= 30) batchSize = 7; // Weekly chunks for medium ranges
      else if (days <= 60) batchSize = 15; // Bi-weekly chunks for larger ranges
      else batchSize = 30; // Monthly chunks for very large ranges
    } else {
      batchSize = parseInt(batch_size) || 7;
    }
    
    const totalBatches = Math.ceil(days / batchSize);
    
    if (days > 90) {
      return res.status(400).json({
        success: false,
        error: 'Date range too large',
        details: 'Maximum 90 days allowed per request',
        received: `${days} days`,
        suggestion: 'Break into smaller ranges (e.g., weekly chunks)',
        recommended_batches: `Use batch_size=${batchSize} for ${days} days`
      });
    }
    
    const cacheKey = `analytics-range:${start_date}:${end_date}:${channel || 'all'}`;
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const rateLimitKey = `analytics-range-${clientIp}`;
    
    try {
      await rateLimitedApiCall(rateLimitKey, async () => Promise.resolve());
    } catch (rateLimitError) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded for range analytics',
        details: 'Too many requests. Please try again later.',
        retryAfter: 60
      });
    }
    
    // Initialize range data
    const rangeData = {
      success: true,
      dateRange: {
        start: start_date,
        end: end_date,
        days: days,
        startFormatted: startDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        endFormatted: endDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      },
      channel: channel || 'all',
      dailyData: [],
      summary: {
        totalViews: 0,
        totalPremiumViews: 0,
        totalRevenue: 0,
        averageRPM: 0,
        dataPoints: 0,
        dataAvailability: 0,
        errors: 0,
        successRate: 0
      },
      status: 'computing',
      progress: 0
    };
    
    // Fetch real data from Playist API for each date
    let totalViews = 0;
    let totalPremiumViews = 0;
    let totalRevenue = 0;
    let dataPoints = 0;
    let errors = 0;
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Update progress
      rangeData.progress = Math.round(((i + 1) / days) * 100);
      
      try {
        // Fetch data for this specific date from Playist API
        const reportingUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.REPORTING_DAILY}`;
        
        const response = await axios.get(reportingUrl, {
          headers: {
            'ZS-API-Auth': PLAYIST_API_KEY,
            'Accept-Language': 'en',
            'Accept': 'application/zip, application/octet-stream',
            'User-Agent': 'Range-Analytics/1.0',
          },
          params: { 
            date: dateStr
          },
          responseType: 'arraybuffer',
          timeout: 15000,
          validateStatus: () => true,
        });
        
        if (response.status === 200 && response.data && response.data.length > 0) {
          try {
            // Parse ZIP file for this date
            const zip = new AdmZip(response.data);
            const zipEntries = zip.getEntries();
            
            let dailyViews = 0;
            let dailyPremiumViews = 0;
            let dailyRevenue = 0;
            let hasData = false;
            
            // Extract data (filter by channel if specified)
            for (const entry of zipEntries) {
              if (entry.entryName === 'data.csv' && entry.entryName.endsWith('.csv')) {
                const csvContent = entry.getData().toString('utf8');
                const lines = csvContent.split('\n').filter(line => line.trim());
                
                if (lines.length > 1) {
                  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                  
                  for (let j = 1; j < lines.length; j++) {
                    const values = lines[j].split(',').map(v => v.trim().replace(/"/g, ''));
                    const row = {};
                    
                    headers.forEach((header, index) => {
                      row[header] = values[index] || '';
                    });
                    
                    // If channel is specified, filter by it
                    if (channel) {
                      // Prefer CID if present; otherwise, use channel/name fields
                      let channelField = row['CID'] || row['Channel Name'] || row['Channel'] || row['Channel ID'] || '';
                      if (normalizeChannel(channelField).includes(normalizeChannel(channel))) {
                        hasData = true;
                        
                        const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                        const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                        const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                        
                        // NEW: Parse the Analytics JSON column for nested view data
                        let analyticsViews = 0;
                        let analyticsPremiumViews = 0;
                        let analyticsRevenue = 0;
                        
                        if (row['Analytics'] || row['analytics']) {
                          try {
                            const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                            if (Array.isArray(analyticsData)) {
                              analyticsData.forEach(countryData => {
                                if (Array.isArray(countryData)) {
                                  countryData.forEach(item => {
                                    analyticsViews += parseInt(item.views || 0) || 0;
                                    analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                    analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                                  });
                                } else if (typeof countryData === 'object') {
                                  analyticsViews += parseInt(countryData.views || 0) || 0;
                                  analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                                  analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                                }
                              });
                            }
                          } catch (jsonError) {
                            console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                          }
                        }
                        
                        // Use the highest value between top-level and analytics data
                        const finalViews = Math.max(views, analyticsViews);
                        const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                        const finalRevenue = Math.max(revenue, analyticsRevenue);
                        
                        dailyViews += finalViews;
                        dailyPremiumViews += finalPremiumViews;
                        dailyRevenue += finalRevenue;
                      }
                    } else {
                      // No channel filter - sum all data
                      hasData = true;
                      
                      const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                      const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                      const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                      
                      // NEW: Parse the Analytics JSON column for nested view data
                      let analyticsViews = 0;
                      let analyticsPremiumViews = 0;
                      let analyticsRevenue = 0;
                      
                      if (row['Analytics'] || row['analytics']) {
                        try {
                          const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                          if (Array.isArray(analyticsData)) {
                            analyticsData.forEach(countryData => {
                              if (Array.isArray(countryData)) {
                                countryData.forEach(item => {
                                  analyticsViews += parseInt(item.views || 0) || 0;
                                  analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                  analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                                });
                              } else if (typeof countryData === 'object') {
                                analyticsViews += parseInt(countryData.views || 0) || 0;
                                analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                                analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                              }
                            });
                          }
                        } catch (jsonError) {
                          console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                        }
                      }
                      
                      // Use the highest value between top-level and analytics data
                      const finalViews = Math.max(views, analyticsViews);
                      const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                      const finalRevenue = Math.max(revenue, analyticsRevenue);
                      
                      dailyViews += finalViews;
                      dailyPremiumViews += finalPremiumViews;
                      dailyRevenue += finalRevenue;
                    }
                  }
                }
              }
            }
            
            if (hasData && dailyViews > 0) {
              totalViews += dailyViews;
              totalPremiumViews += dailyPremiumViews;
              totalRevenue += dailyRevenue;
              dataPoints++;
              
              rangeData.dailyData.push({
                date: dateStr,
                views: dailyViews,
                premiumViews: dailyPremiumViews,
                rpm: dailyViews > 0 ? Math.round((dailyRevenue * 1000 / dailyViews) * 100) / 100 : 0,
                revenue: Math.round(dailyRevenue * 100) / 100,
                hasData: true,
                dataSize: response.data.length
              });
            } else {
              rangeData.dailyData.push({
                date: dateStr,
                views: 0,
                premiumViews: 0,
                rpm: 0,
                revenue: 0,
                hasData: false,
                note: channel ? 'No data available for this channel/date' : 'No data available for this date'
              });
            }
            
          } catch (zipError) {
            console.error(`Error parsing ZIP for ${dateStr}:`, zipError);
            rangeData.dailyData.push({
              date: dateStr,
              views: 0,
              premiumViews: 0,
              rpm: 0,
              revenue: 0,
              hasData: false,
              note: 'Error parsing ZIP data',
              error: zipError.message
            });
            errors++;
          }
        } else if (response.status === 400 && response.data?.response_code === 130002) {
          // No data available for this date (normal)
          rangeData.dailyData.push({
            date: dateStr,
            views: 0,
            premiumViews: 0,
            rpm: 0,
            revenue: 0,
            hasData: false,
            note: 'Report not ready for this date (130002)'
          });
        } else if (response.status === 429) {
          // Rate limit exceeded - wait longer and retry once
          console.log(`Rate limit hit for ${dateStr}, waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          try {
            // Retry the request after waiting
            const retryResponse = await axios.get(reportingUrl, {
              headers: {
                'ZS-API-Auth': PLAYIST_API_KEY,
                'Accept-Language': 'en',
                'Accept': 'application/zip, application/octet-stream',
                'User-Agent': 'Range-Analytics/1.0',
              },
              params: { 
                date: dateStr
              },
              responseType: 'arraybuffer',
              timeout: 15000,
              validateStatus: () => true,
            });
            
            if (retryResponse.status === 200 && retryResponse.data && retryResponse.data.length > 0) {
              // Process retry response (same logic as above)
              const zip = new AdmZip(retryResponse.data);
              const zipEntries = zip.getEntries();
              
              let dailyViews = 0;
              let dailyPremiumViews = 0;
              let dailyRevenue = 0;
              let hasData = false;
              
              for (const entry of zipEntries) {
                if (entry.entryName === 'data.csv' && entry.entryName.endsWith('.csv')) {
                  const csvContent = entry.getData().toString('utf8');
                  const lines = csvContent.split('\n').filter(line => line.trim());
                  
                  if (lines.length > 1) {
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    for (let j = 1; j < lines.length; j++) {
                      const values = lines[j].split(',').map(v => v.trim().replace(/"/g, ''));
                      const row = {};
                      
                      headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                      });
                      
                      if (channel) {
                        // Prefer CID if present; otherwise, use channel/name fields
                        let channelField = row['CID'] || row['Channel Name'] || row['Channel'] || row['Channel ID'] || '';
                        if (normalizeChannel(channelField).includes(normalizeChannel(channel))) {
                          hasData = true;
                          
                          const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                          const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                          const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                          
                          // NEW: Parse the Analytics JSON column for nested view data
                          let analyticsViews = 0;
                          let analyticsPremiumViews = 0;
                          let analyticsRevenue = 0;
                          
                          if (row['Analytics'] || row['analytics']) {
                            try {
                              const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                              if (Array.isArray(analyticsData)) {
                                analyticsData.forEach(countryData => {
                                  if (Array.isArray(countryData)) {
                                    countryData.forEach(item => {
                                      analyticsViews += parseInt(item.views || 0) || 0;
                                      analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                      analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                                    });
                                  } else if (typeof countryData === 'object') {
                                    analyticsViews += parseInt(countryData.views || 0) || 0;
                                    analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                                    analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                                  }
                                });
                              }
                            } catch (jsonError) {
                              console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                            }
                          }
                          
                          // Use the highest value between top-level and analytics data
                          const finalViews = Math.max(views, analyticsViews);
                          const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                          const finalRevenue = Math.max(revenue, analyticsRevenue);
                          
                          dailyViews += finalViews;
                          dailyPremiumViews += finalPremiumViews;
                          dailyRevenue += finalRevenue;
                        }
                      } else {
                        hasData = true;
                        
                        const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                        const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                        const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                        
                        // NEW: Parse the Analytics JSON column for nested view data
                        let analyticsViews = 0;
                        let analyticsPremiumViews = 0;
                        let analyticsRevenue = 0;
                        
                        if (row['Analytics'] || row['analytics']) {
                          try {
                            const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                            if (Array.isArray(analyticsData)) {
                              analyticsData.forEach(countryData => {
                                if (Array.isArray(countryData)) {
                                  countryData.forEach(item => {
                                    analyticsViews += parseInt(item.views || 0) || 0;
                                    analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                    analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                                  });
                                } else if (typeof countryData === 'object') {
                                  analyticsViews += parseInt(countryData.views || 0) || 0;
                                  analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                                  analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                                }
                              });
                            }
                          } catch (jsonError) {
                            console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                          }
                        }
                        
                        // Use the highest value between top-level and analytics data
                        const finalViews = Math.max(views, analyticsViews);
                        const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                        const finalRevenue = Math.max(revenue, analyticsRevenue);
                        
                        dailyViews += finalViews;
                        dailyPremiumViews += finalPremiumViews;
                        dailyRevenue += finalRevenue;
                      }
                    }
                  }
                }
              }
              
              if (hasData && dailyViews > 0) {
                totalViews += dailyViews;
                totalPremiumViews += dailyPremiumViews;
                totalRevenue += dailyRevenue;
                dataPoints++;
                
                rangeData.dailyData.push({
                  date: dateStr,
                  views: dailyViews,
                  premiumViews: dailyPremiumViews,
                  rpm: dailyViews > 0 ? Math.round((dailyRevenue * 1000 / dailyViews) * 100) / 100 : 0,
                  revenue: Math.round(dailyRevenue * 100) / 100,
                  hasData: true,
                  dataSize: retryResponse.data.length,
                  note: 'Retry successful after rate limit'
                });
              } else {
                rangeData.dailyData.push({
                  date: dateStr,
                  views: 0,
                  premiumViews: 0,
                  rpm: 0,
                  revenue: 0,
                  hasData: false,
                  note: 'No data available (after retry)'
                });
              }
            } else {
              rangeData.dailyData.push({
                date: dateStr,
                views: 0,
                premiumViews: 0,
                rpm: 0,
                revenue: 0,
                hasData: false,
                note: 'Rate limit retry failed'
              });
              errors++;
            }
          } catch (retryError) {
            rangeData.dailyData.push({
              date: dateStr,
              views: 0,
              premiumViews: 0,
              rpm: 0,
              revenue: 0,
              hasData: false,
              note: 'Rate limit retry failed',
              error: retryError.message
            });
            errors++;
          }
        } else {
          // API error for this date
          rangeData.dailyData.push({
            date: dateStr,
            views: 0,
            premiumViews: 0,
            rpm: 0,
            revenue: 0,
            hasData: false,
            note: `API error: ${response.status}`,
            error: response.data?.message || 'Unknown error'
          });
          errors++;
        }
        
        // Dynamic rate limiting - longer delays for larger ranges to avoid rate limits
        if (i < days - 1) {
          let delay = 2000; // Base delay: 2 seconds
          
          // Increase delay for larger ranges
          if (days > 30) {
            delay = 5000; // 5 seconds for 31+ days
          }
          if (days > 60) {
            delay = 8000; // 8 seconds for 61+ days
          }
          if (days > 80) {
            delay = 10000; // 10 seconds for 80+ days
          }
          
          // Add extra delay between batches
          const currentBatch = Math.floor(i / batchSize);
          const nextBatch = Math.floor((i + 1) / batchSize);
          
          if (nextBatch > currentBatch) {
            // We're moving to a new batch, add longer break
            const batchBreak = Math.min(30000, batchSize * 2000); // 30 seconds max, or 2 seconds per day in batch
            console.log(`Batch ${currentBatch + 1}/${totalBatches} completed. Taking ${batchBreak/1000} second break before next batch...`);
            await new Promise(resolve => setTimeout(resolve, batchBreak));
          } else {
            // Regular delay within batch
            console.log(`Waiting ${delay/1000} seconds before next request (${i+1}/${days} completed, batch ${currentBatch + 1}/${totalBatches})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
      } catch (apiError) {
        console.error(`Error fetching data for ${dateStr}:`, apiError);
        rangeData.dailyData.push({
          date: dateStr,
          views: 0,
          premiumViews: 0,
          rpm: 0,
          revenue: 0,
          hasData: false,
          note: 'API request failed',
          error: apiError.message
        });
        errors++;
      }
    }
    
    // Calculate final summary metrics
    rangeData.summary = {
      totalViews: totalViews,
      totalPremiumViews: totalPremiumViews,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRPM: totalViews > 0 ? Math.round((totalRevenue * 1000 / totalViews) * 100) / 100 : 0,
      dataPoints: dataPoints,
      dataAvailability: Math.round((dataPoints / days) * 100),
      errors: errors,
      successRate: Math.round(((days - errors) / days) * 100)
    };
    
    rangeData.status = 'completed';
    rangeData.progress = 100;
    rangeData.notice = `Computed range analytics from ${start_date} to ${end_date}. Found data for ${dataPoints} out of ${days} days.`;
    rangeData.implementation = 'Production endpoint: Fetches real data from Playist API for each date in the range.';
    
    setCacheResponse(cacheKey, rangeData);
    return res.status(200).json(rangeData);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error processing date range request',
      details: error.message
    });
  }
});

// Channel-specific analytics endpoint
app.get('/api/analytics/channels', async (req, res) => {
  try {
    const { channel, date } = req.query;
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    const targetDate = date || defaultDate;
    
    const targetChannel = channel || 'offline ace';
    
    const cacheKey = `analytics-channel:${targetChannel}:${targetDate}`;
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const rateLimitKey = `analytics-channel-${targetChannel}-${clientIp}`;
    
    try {
      await rateLimitedApiCall(rateLimitKey, async () => Promise.resolve());
    } catch (rateLimitError) {
      const sampleResponse = generateChannelAnalyticsData(targetChannel, targetDate);
      setCacheResponse(cacheKey, sampleResponse);
      return res.status(200).json(sampleResponse);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const targetDateObj = new Date(targetDate);
    if (targetDateObj > today) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date',
        details: 'Analytics data is only available for past dates. Future dates are not supported.',
        requestedDate: targetDate
      });
    }

    try {
      const reportingUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.REPORTING_DAILY}`;
      
      // Request ZIP file with arraybuffer response type
      const response = await axios.get(reportingUrl, {
        headers: {
          'ZS-API-Auth': PLAYIST_API_KEY,
          'Accept-Language': 'en',
          'Accept': 'application/zip, application/octet-stream',
          'User-Agent': 'Channel-Analytics/1.0',
        },
        params: { 
          date: targetDate
        },
        responseType: 'arraybuffer', // Important: Get binary data
        validateStatus: () => true,
      });

      if (response.status === 200 && response.data) {
        try {
          // Parse ZIP file
          const zip = new AdmZip(response.data);
          const zipEntries = zip.getEntries();
          
          // Extract channel-specific data
          let channelViews = 0;
          let channelPremiumViews = 0;
          let channelRevenue = 0;
          let channelVideos = [];
          let channelMusic = [];
          
          for (const entry of zipEntries) {
            if (entry.entryName.endsWith('.csv')) {
              const csvContent = entry.getData().toString('utf8');
              const lines = csvContent.split('\n').filter(line => line.trim());
              
              if (lines.length > 1) {
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                for (let i = 1; i < lines.length; i++) {
                  const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                  const row = {};
                  
                  headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                  });
                  
                  // Filter by channel using CID match when available
                  let channelMatch = row['CID'] || '';
                  if (!channelMatch) {
                    // Fallback to any provided channel-like fields
                    channelMatch = row['Channel Name'] || row['Channel'] || row['Channel ID'] || '';
                  }
                  const matched = normalizeChannel(channelMatch).includes(normalizeChannel(targetChannel));
                  if (matched) {
                    
                    if (entry.entryName === 'data.csv') {
                      const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                      const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                      const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                      
                      // NEW: Parse the Analytics JSON column for nested view data
                      let analyticsViews = 0;
                      let analyticsPremiumViews = 0;
                      let analyticsRevenue = 0;
                      
                      if (row['Analytics'] || row['analytics']) {
                        try {
                          const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                          if (Array.isArray(analyticsData)) {
                            analyticsData.forEach(countryData => {
                              if (Array.isArray(countryData)) {
                                countryData.forEach(item => {
                                  analyticsViews += parseInt(item.views || 0) || 0;
                                  analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                  analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                                });
                              } else if (typeof countryData === 'object') {
                                analyticsViews += parseInt(countryData.views || 0) || 0;
                                analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                                analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                              }
                            });
                          }
                        } catch (jsonError) {
                          console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                        }
                      }
                      
                      // Use the highest value between top-level and analytics data
                      const finalViews = Math.max(views, analyticsViews);
                      const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                      const finalRevenue = Math.max(revenue, analyticsRevenue);
                      
                      channelViews += finalViews;
                      channelPremiumViews += finalPremiumViews;
                      channelRevenue += finalRevenue;
                    } else if (entry.entryName === 'video.csv') {
                      channelVideos.push(row);
                    } else if (entry.entryName === 'music.csv') {
                      channelMusic.push(row);
                    }
                  }
                }
              }
            }
          }
          
          const channelRpm = channelViews > 0 ? (channelRevenue * 1000) / channelViews : 0;
          
          const successResponse = {
            success: true,
            channel: targetChannel,
            date: targetDate,
            kpis: {
              totalViews: channelViews,
              premiumViews: channelPremiumViews,
              rpm: Math.round(channelRpm * 100) / 100,
              expectedRevenue: Math.round(channelRevenue * 100) / 100
            },
            data: {
              videos: channelVideos.length,
              music: channelMusic.length,
              totalRows: channelViews > 0 ? 'Data found' : 'No data for this channel/date'
            },
            isZIPData: true,
            notice: channelViews === 0 ? `No data available for ${targetChannel} on ${targetDate}` : 'Channel data extracted successfully'
          };
          
          setCacheResponse(cacheKey, successResponse);
          return res.status(200).json(successResponse);
          
        } catch (zipError) {
          console.error('Error parsing ZIP for channel:', zipError);
          const sampleResponse = generateChannelAnalyticsData(targetChannel, targetDate);
          setCacheResponse(cacheKey, sampleResponse);
          return res.status(200).json(sampleResponse);
        }
      }

      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed with Playist Studio API. Please check your API credentials.',
          details: 'Unable to access reporting endpoint',
          suggestion: 'Verify your API key is valid and your IP is whitelisted'
        });
      }

      if (response.data?.response_code === 2) {
        const sampleResponse = generateChannelAnalyticsData(targetChannel, targetDate);
        setCacheResponse(cacheKey, sampleResponse);
        return res.status(200).json(sampleResponse);
      }
      
      return res.status(response.status).json({
        success: false,
        error: `API request failed with status ${response.status}`,
        details: response.data?.message || 'Unknown error',
        rawResponse: response.data,
        debug: { requestedDate: targetDate, channel: targetChannel, url: reportingUrl }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: 60
          });
        }
        const statusCode = error.response?.status || 500;
        const errorData = error.response?.data || {};
        return res.status(statusCode).json({
          success: false,
          error: 'Failed to fetch channel analytics data',
          details: errorData.message || error.message,
          statusCode
        });
    } else {
        return res.status(500).json({ 
          success: false,
          error: 'Internal server error while fetching channel analytics data',
          details: error.message
        });
      }
    }
  } catch (outerError) {
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error in channel analytics endpoint',
      details: outerError.message
    });
  }
});

// Channels list endpoint
app.get('/api/analytics/channels/list', async (req, res) => {
  try {
    const cacheKey = 'channels-list';
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const rateLimitKey = `channels-list-${clientIp}`;
    
    try {
      await rateLimitedApiCall(rateLimitKey, async () => Promise.resolve());
    } catch (rateLimitError) {
      const sampleChannels = [
        { 
          id: 'offline_ace', 
          name: 'Offline Ace', 
          status: 'active',
          thumbnail: 'https://via.placeholder.com/100',
          registration_date: '2025-05-03',
          approval_date: '2025-05-03'
        }
      ];
      
      const sampleResponse = {
        success: true,
        channels: sampleChannels,
        isSampleData: true,
        notice: 'Displaying sample channels due to API rate limits or unavailability.'
      };
      
      setCacheResponse(cacheKey, sampleResponse);
      return res.status(200).json(sampleResponse);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const channelsUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.CHANNEL_LIST}`;
      
      const response = await axios.get(channelsUrl, {
        headers: {
          'ZS-API-Auth': PLAYIST_API_KEY,
          'Accept-Language': 'en',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Channels-List/1.0',
        },
        validateStatus: () => true,
      });

      if (response.status === 200 && response.data) {
        let channels = [];
        
        if (response.data.datas && Array.isArray(response.data.datas)) {
          channels = response.data.datas.map(ch => ({
            id: ch.channel_id || ch.id,
            name: ch.name || ch.channel_name,
            status: ch.status || 'active',
            thumbnail: ch.thumbnail || 'https://via.placeholder.com/100',
            registration_date: ch.registered_date ? new Date(ch.registered_date * 1000).toISOString().split('T')[0] : '2025-05-03',
            approval_date: ch.approved ? new Date().toISOString().split('T')[0] : '2025-05-03'
          }));
        } else if (response.data.channels && Array.isArray(response.data.channels)) {
          channels = response.data.channels.map(ch => ({
            id: ch.id || ch.channel_id,
            name: ch.name || ch.channel_name,
            status: ch.status || 'active',
            thumbnail: ch.thumbnail || 'https://via.placeholder.com/100',
            registration_date: ch.registration_date || '2025-05-03',
            approval_date: ch.approval_date || '2025-05-03'
          }));
        }
        
        const successResponse = {
          success: true,
          channels: channels,
          total: channels.length
        };
        
        setCacheResponse(cacheKey, successResponse);
        return res.status(200).json(successResponse);
      }

      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed with Playist Studio API. Please check your API credentials.',
          details: 'Unable to access channels endpoint',
          suggestion: 'Verify your API key is valid and your IP is whitelisted'
        });
      }
      
      return res.status(response.status).json({
        success: false,
        error: `API request failed with status ${response.status}`,
        details: response.data?.message || 'Unknown error',
        rawResponse: response.data
      });
  } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: 60
          });
        }
        const statusCode = error.response?.status || 500;
        const errorData = error.response?.data || {};
        return res.status(statusCode).json({
          success: false,
          error: 'Failed to fetch channels list',
          details: errorData.message || error.message,
          statusCode
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Internal server error while fetching channels list',
          details: error.message
        });
      }
    }
  } catch (outerError) {
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error in channels list endpoint',
      details: outerError.message
    });
  }
});

// New endpoint for channel analytics from approval date to current
app.get('/api/analytics/channels/compute', async (req, res) => {
  try {
    const { channel, approval_date, end_date } = req.query;
    
    if (!channel) {
      return res.status(400).json({
        success: false,
        error: 'Missing channel parameter',
        details: 'Channel name is required',
        examples: [
          'channel=offline%20ace',
          'channel=orangetube'
        ]
      });
    }
    
    const today = new Date();
    
    // Use provided end_date or default to today
    const endDate = end_date ? new Date(end_date) : today;
    
    // Use provided approval_date or default to a reasonable start date
    let startDate;
    if (approval_date) {
      startDate = new Date(approval_date);
    } else {
      // Default to 30 days ago if no approval date provided
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
    }
    
    // Date validation
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        details: 'Dates must be in YYYY-MM-DD format',
        examples: ['2024-12-01', '2025-05-03']
      });
    }
    
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        details: 'Start date must be before or equal to end date',
        received: { 
          start_date: approval_date || startDate.toISOString().split('T')[0], 
          end_date: end_date || endDate.toISOString().split('T')[0] 
        }
      });
    }
    
    if (endDate > today) {
      return res.status(400).json({
        success: false,
        error: 'End date cannot be in the future',
        details: 'Use dates up to today',
        suggestion: 'Remove end_date parameter to use today automatically'
      });
    }
    
    // Calculate date range
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Determine batch size for processing
    let batchSize = 7; // Default to weekly chunks
    if (batch_size === 'auto') {
      if (days <= 7) batchSize = days; // No batching for small ranges
      else if (days <= 30) batchSize = 7; // Weekly chunks for medium ranges
      else if (days <= 60) batchSize = 15; // Bi-weekly chunks for larger ranges
      else batchSize = 30; // Monthly chunks for very large ranges
    } else {
      batchSize = parseInt(batch_size) || 7;
    }
    
    const totalBatches = Math.ceil(days / batchSize);
    
    if (days > 90) {
      return res.status(400).json({
        success: false,
        error: 'Date range too large',
        details: 'Maximum 90 days allowed for computation',
        received: `${days} days`,
        suggestion: 'Break into smaller ranges (e.g., weekly chunks)',
        recommended_batches: `Use batch_size=${batchSize} for ${days} days`
      });
    }
    
    const cacheKey = `analytics-compute:${channel}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`;
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const rateLimitKey = `analytics-compute-${channel}-${clientIp}`;
    
    try {
      await rateLimitedApiCall(rateLimitKey, async () => Promise.resolve());
    } catch (rateLimitError) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded for computation',
        details: 'Too many requests. Please try again later.',
        retryAfter: 60
      });
    }
    
    // Initialize computation data
    const computedData = {
      success: true,
      channel: channel,
      computation: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalDays: days,
        startFormatted: startDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        endFormatted: endDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      },
      dailyData: [],
      summary: {
        totalViews: 0,
        totalPremiumViews: 0,
        totalRevenue: 0,
        averageRPM: 0,
        dataPoints: 0,
        dataAvailability: 0
      },
      status: 'computing',
      progress: 0
    };
    
    // Fetch real data from Playist API for each date
    let totalViews = 0;
    let totalPremiumViews = 0;
    let totalRevenue = 0;
    let dataPoints = 0;
    let errors = 0;
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Update progress
      computedData.progress = Math.round(((i + 1) / days) * 100);
      
      try {
        // Fetch data for this specific date from Playist API
        const reportingUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.REPORTING_DAILY}`;
        
        const response = await axios.get(reportingUrl, {
          headers: {
            'ZS-API-Auth': PLAYIST_API_KEY,
            'Accept-Language': 'en',
            'Accept': 'application/zip, application/octet-stream',
            'User-Agent': 'Channel-Compute/1.0',
          },
          params: { 
            date: dateStr
          },
          responseType: 'arraybuffer',
          timeout: 15000, // 15 second timeout per date
          validateStatus: () => true,
        });
        
        if (response.status === 200 && response.data && response.data.length > 0) {
          try {
            // Parse ZIP file for this date
            const zip = new AdmZip(response.data);
            const zipEntries = zip.getEntries();
            
            let dailyViews = 0;
            let dailyPremiumViews = 0;
            let dailyRevenue = 0;
            let hasChannelData = false;
            
            // Extract data for this specific channel
            for (const entry of zipEntries) {
              if (entry.entryName === 'data.csv' && entry.entryName.endsWith('.csv')) {
                const csvContent = entry.getData().toString('utf8');
                const lines = csvContent.split('\n').filter(line => line.trim());
                
                if (lines.length > 1) {
                  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                  
                  for (let j = 1; j < lines.length; j++) {
                    const values = lines[j].split(',').map(v => v.trim().replace(/"/g, ''));
                    const row = {};
                    
                    headers.forEach((header, index) => {
                      row[header] = values[index] || '';
                    });
                    
                    // Check if this row belongs to our target channel
                    let channelField = row['CID'] || row['Channel Name'] || row['Channel'] || row['Channel ID'] || '';
                    if (normalizeChannel(channelField).includes(normalizeChannel(channel))) {
                      hasChannelData = true;
                      
                      const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                      const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                      const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                      
                      // NEW: Parse the Analytics JSON column for nested view data
                      let analyticsViews = 0;
                      let analyticsPremiumViews = 0;
                      let analyticsRevenue = 0;
                      
                      if (row['Analytics'] || row['analytics']) {
                        try {
                          const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                          if (Array.isArray(analyticsData)) {
                            analyticsData.forEach(countryData => {
                              if (Array.isArray(countryData)) {
                                countryData.forEach(item => {
                                  analyticsViews += parseInt(item.views || 0) || 0;
                                  analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                  analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                                });
                              } else if (typeof countryData === 'object') {
                                analyticsViews += parseInt(countryData.views || 0) || 0;
                                analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                                analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                              }
                            });
                          }
                        } catch (jsonError) {
                          console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                        }
                      }
                      
                      // Use the highest value between top-level and analytics data
                      const finalViews = Math.max(views, analyticsViews);
                      const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                      const finalRevenue = Math.max(revenue, analyticsRevenue);
                      
                      dailyViews += finalViews;
                      dailyPremiumViews += finalPremiumViews;
                      dailyRevenue += finalRevenue;
                    }
                  }
                }
              }
            }
            
            if (hasChannelData && dailyViews > 0) {
              totalViews += dailyViews;
              totalPremiumViews += dailyPremiumViews;
              totalRevenue += dailyRevenue;
              dataPoints++;
              
              computedData.dailyData.push({
                date: dateStr,
                views: dailyViews,
                premiumViews: dailyPremiumViews,
                rpm: dailyViews > 0 ? Math.round((dailyRevenue * 1000 / dailyViews) * 100) / 100 : 0,
                revenue: Math.round(dailyRevenue * 100) / 100,
                hasData: true,
                dataSize: response.data.length
              });
    } else {
              computedData.dailyData.push({
                date: dateStr,
                views: 0,
                premiumViews: 0,
                rpm: 0,
                revenue: 0,
                hasData: false,
                note: 'No data available for this channel/date'
              });
            }
            
          } catch (zipError) {
            console.error(`Error parsing ZIP for ${dateStr}:`, zipError);
            computedData.dailyData.push({
              date: dateStr,
              views: 0,
              premiumViews: 0,
              rpm: 0,
              revenue: 0,
              hasData: false,
              note: 'Error parsing ZIP data',
              error: zipError.message
            });
            errors++;
          }
        } else if (response.status === 400 && response.data?.response_code === 130002) {
          // No data available for this date (normal)
          computedData.dailyData.push({
            date: dateStr,
            views: 0,
            premiumViews: 0,
            rpm: 0,
            revenue: 0,
            hasData: false,
            note: 'Report not ready for this date (130002)'
          });
        } else if (response.status === 429) {
          // Rate limit exceeded - wait longer and retry once
          console.log(`Rate limit hit for ${dateStr}, waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          try {
            // Retry the request after waiting
            const retryResponse = await axios.get(reportingUrl, {
              headers: {
                'ZS-API-Auth': PLAYIST_API_KEY,
                'Accept-Language': 'en',
                'Accept': 'application/zip, application/octet-stream',
                'User-Agent': 'Channel-Compute/1.0',
              },
              params: { 
                date: dateStr
              },
              responseType: 'arraybuffer',
              timeout: 15000,
              validateStatus: () => true,
            });
            
            if (retryResponse.status === 200 && retryResponse.data && retryResponse.data.length > 0) {
              // Process retry response same as before
              const zip = new AdmZip(retryResponse.data);
              const zipEntries = zip.getEntries();
              
              let dailyViews = 0;
              let dailyPremiumViews = 0;
              let dailyRevenue = 0;
              let hasChannelData = false;
              
              for (const entry of zipEntries) {
                if (entry.entryName === 'data.csv' && entry.entryName.endsWith('.csv')) {
                  const csvContent = entry.getData().toString('utf8');
                  const lines = csvContent.split('\n').filter(line => line.trim());
                  
                  if (lines.length > 1) {
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    for (let j = 1; j < lines.length; j++) {
                      const values = lines[j].split(',').map(v => v.trim().replace(/"/g, ''));
                      const row = {};
                      
                      headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                      });
                      
                      const channelMatch = row['Channel Name'] || row['Channel'] || row['CID'] || row['Channel ID'];
                      if (channelMatch && channelMatch.toLowerCase().includes(channel.toLowerCase())) {
                        hasChannelData = true;
                        
                        const views = parseInt(row['Views'] || row['views'] || row['View'] || row['view'] || '0') || 0;
                        const premiumViews = parseInt(row['Premium Views'] || row['PremiumViews'] || row['Premium_Views'] || row['premium_views'] || '0') || 0;
                        const revenue = parseFloat(row['Estimated Partner Revenue'] || row['EstimatedPartnerRevenue'] || row['Estimated_Partner_Revenue'] || row['estimated_partner_revenue'] || '0') || 0;
                        
                        // NEW: Parse the Analytics JSON column for nested view data
                        let analyticsViews = 0;
                        let analyticsPremiumViews = 0;
                        let analyticsRevenue = 0;
                        
                        if (row['Analytics'] || row['analytics']) {
                          try {
                            const analyticsData = JSON.parse(row['Analytics'] || row['analytics']);
                            if (Array.isArray(analyticsData)) {
                              analyticsData.forEach(countryData => {
                                if (Array.isArray(countryData)) {
                                  countryData.forEach(item => {
                                    analyticsViews += parseInt(item.views || 0) || 0;
                                    analyticsPremiumViews += parseInt(item.premium_views || 0) || 0;
                                    analyticsRevenue += parseFloat(item.estimated_partner_revenue || 0) || 0;
                                  });
                                } else if (typeof countryData === 'object') {
                                  analyticsViews += parseInt(countryData.views || 0) || 0;
                                  analyticsPremiumViews += parseInt(countryData.premium_views || 0) || 0;
                                  analyticsRevenue += parseFloat(countryData.estimated_partner_revenue || 0) || 0;
                                }
                              });
                            }
                          } catch (jsonError) {
                            console.log(`JSON parse error for Analytics column: ${jsonError.message}`);
                          }
                        }
                        
                        // Use the highest value between top-level and analytics data
                        const finalViews = Math.max(views, analyticsViews);
                        const finalPremiumViews = Math.max(premiumViews, analyticsPremiumViews);
                        const finalRevenue = Math.max(revenue, analyticsRevenue);
                        
                        dailyViews += finalViews;
                        dailyPremiumViews += finalPremiumViews;
                        dailyRevenue += finalRevenue;
                      }
                    }
                  }
                }
              }
              
              if (hasChannelData && dailyViews > 0) {
                totalViews += dailyViews;
                totalPremiumViews += dailyPremiumViews;
                totalRevenue += dailyRevenue;
                dataPoints++;
                
                computedData.dailyData.push({
                  date: dateStr,
                  views: dailyViews,
                  premiumViews: dailyPremiumViews,
                  rpm: dailyViews > 0 ? Math.round((dailyRevenue * 1000 / dailyViews) * 100) / 100 : 0,
                  revenue: Math.round(dailyRevenue * 100) / 100,
                  hasData: true,
                  dataSize: retryResponse.data.length,
                  note: 'Retry successful after rate limit'
                });
              } else {
                computedData.dailyData.push({
                  date: dateStr,
                  views: 0,
                  premiumViews: 0,
                  rpm: 0,
                  revenue: 0,
                  hasData: false,
                  note: 'No data available for this channel/date (after retry)'
                });
              }
            } else {
              computedData.dailyData.push({
                date: dateStr,
                views: 0,
                premiumViews: 0,
                rpm: 0,
                revenue: 0,
                hasData: false,
                note: 'Rate limit retry failed'
              });
              errors++;
            }
          } catch (retryError) {
            computedData.dailyData.push({
              date: dateStr,
              views: 0,
              premiumViews: 0,
              rpm: 0,
              revenue: 0,
              hasData: false,
              note: 'Rate limit retry failed',
              error: retryError.message
            });
            errors++;
          }
        } else {
          // API error for this date
          computedData.dailyData.push({
            date: dateStr,
            views: 0,
            premiumViews: 0,
            rpm: 0,
            revenue: 0,
            hasData: false,
            note: `API error: ${response.status}`,
            error: response.data?.message || 'Unknown error'
          });
          errors++;
        }
        
        // Dynamic rate limiting - longer delays for larger ranges to avoid rate limits
        if (i < days - 1) {
          let delay = 2000; // Base delay: 2 seconds
          
          // Increase delay for larger ranges
          if (days > 30) {
            delay = 5000; // 5 seconds for 31+ days
          }
          if (days > 60) {
            delay = 8000; // 8 seconds for 61+ days
          }
          if (days > 80) {
            delay = 10000; // 10 seconds for 80+ days
          }
          
          // Add extra delay between batches
          const currentBatch = Math.floor(i / batchSize);
          const nextBatch = Math.floor((i + 1) / batchSize);
          
          if (nextBatch > currentBatch) {
            // We're moving to a new batch, add longer break
            const batchBreak = Math.min(30000, batchSize * 2000); // 30 seconds max, or 2 seconds per day in batch
            console.log(`Batch ${currentBatch + 1}/${totalBatches} completed. Taking ${batchBreak/1000} second break before next batch...`);
            await new Promise(resolve => setTimeout(resolve, batchBreak));
          } else {
            // Regular delay within batch
            console.log(`Waiting ${delay/1000} seconds before next request (${i+1}/${days} completed, batch ${currentBatch + 1}/${totalBatches})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
      } catch (apiError) {
        console.error(`Error fetching data for ${dateStr}:`, apiError);
        computedData.dailyData.push({
          date: dateStr,
          views: 0,
          premiumViews: 0,
          rpm: 0,
          revenue: 0,
          hasData: false,
          note: 'API request failed',
          error: apiError.message
        });
        errors++;
      }
    }
    
    // Calculate final summary metrics
    computedData.summary = {
      totalViews: totalViews,
      totalPremiumViews: totalPremiumViews,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRPM: totalViews > 0 ? Math.round((totalRevenue * 1000 / totalViews) * 100) / 100 : 0,
      dataPoints: dataPoints,
      dataAvailability: Math.round((dataPoints / days) * 100),
      errors: errors,
      successRate: Math.round(((days - errors) / days) * 100)
    };
    
    computedData.status = 'completed';
    computedData.progress = 100;
    computedData.notice = `Computed analytics for ${channel} from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}. Found data for ${dataPoints} out of ${days} days.`;
    computedData.implementation = 'Production endpoint: Fetches real data from Playist API for each date in the range.';
    
    setCacheResponse(cacheKey, computedData);
    return res.status(200).json(computedData);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error computing channel analytics',
      details: error.message
    });
  }
});

// Debug endpoint to show raw CSV content
app.get('/api/debug/csv/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`🔍 Debug CSV request for date: ${targetDate}`);
    
    const reportingUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.REPORTING_DAILY}`;
    
    const response = await axios.get(reportingUrl, {
      headers: {
        'ZS-API-Auth': PLAYIST_API_KEY,
        'Accept-Language': 'en',
        'Accept': 'application/zip, application/octet-stream',
        'User-Agent': 'Debug-CSV/1.0',
      },
      params: { 
        date: targetDate
      },
      responseType: 'arraybuffer',
      timeout: 15000,
      validateStatus: () => true,
    });
    
    if (response.status === 200 && response.data && response.data.length > 0) {
      try {
        const zip = new AdmZip(response.data);
        const zipEntries = zip.getEntries();
        
        const csvDebug = {};
        
        for (const entry of zipEntries) {
          if (entry.entryName.endsWith('.csv')) {
            const csvContent = entry.getData().toString('utf8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            
            if (lines.length > 0) {
              const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
              
              csvDebug[entry.entryName] = {
                headers: headers,
                totalLines: lines.length,
                firstFewLines: lines.slice(0, 5), // First 5 lines
                rawContent: csvContent.substring(0, 1000), // First 1000 chars
                sampleRow: lines.length > 1 ? lines[1] : null
              };
            }
          }
        }
        
        return res.status(200).json({
          success: true,
          date: targetDate,
          zipSize: response.data.length,
          csvFiles: Object.keys(csvDebug),
          csvDebug: csvDebug,
          notice: 'Raw CSV content for debugging'
        });
        
      } catch (zipError) {
        return res.status(200).json({
          success: false,
          error: 'Error parsing ZIP',
          details: zipError.message,
          zipSize: response.data.length,
          rawData: response.data.toString('hex').substring(0, 200) + '...'
        });
      }
    } else {
      return res.status(response.status).json({
        success: false,
        error: `API request failed with status ${response.status}`,
        details: response.data?.message || 'Unknown error',
        rawResponse: response.data
      });
    }
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Debug endpoint error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Lightsail Analytics Proxy',
    port: process.env.PORT
  });
});

// Queue status endpoint
app.get('/queue/status', (req, res) => {
  res.status(200).json({
    success: true,
    throttling: {
      config: THROTTLING_CONFIG,
      queue: requestQueue.getStatus(),
      adaptive: THROTTLING_CONFIG.adaptive.enabled
    },
    timestamp: new Date().toISOString()
  });
});

// Queue management endpoint
app.post('/queue/clear', (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      requestQueue.endpointCounters.set(endpoint, 0);
    } else {
      requestQueue.endpointCounters.clear();
    }
    
    res.status(200).json({
      success: true,
      message: endpoint ? `Cleared counters for ${endpoint}` : 'Cleared all endpoint counters',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear queue',
      details: error.message
    });
  }
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
  console.log(`Health check available at http://localhost:${process.env.PORT}/health`);
  console.log(`Queue status: http://localhost:${process.env.PORT}/queue/status`);
  console.log(`Music endpoint: http://localhost:${process.env.PORT}/api/music`);
  console.log(`Analytics endpoint: http://localhost:${process.env.PORT}/api/analytics`);
  console.log(`Channel analytics: http://localhost:${process.env.PORT}/api/analytics/channels`);
  console.log(`Channels list: http://localhost:${process.env.PORT}/api/analytics/channels/list`);
  console.log(`Date range analytics: http://localhost:${process.env.PORT}/api/analytics/range`);
  console.log(`Channel compute: http://localhost:${process.env.PORT}/api/analytics/channels/compute`);
  console.log(`\n🚦 Throttling Configuration:`);
  console.log(`   - Adaptive throttling: ${THROTTLING_CONFIG.adaptive.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   - Max concurrent requests: ${THROTTLING_CONFIG.queue.maxConcurrent}`);
  console.log(`   - Base delay: ${THROTTLING_CONFIG.adaptive.baseDelay}ms`);
  console.log(`   - Max delay: ${THROTTLING_CONFIG.adaptive.maxDelay}ms`);
});

const normalizeChannel = (value) => (value || '').toString().trim().toLowerCase();

const getTargetCidFromZipEntries = (zipEntries, targetChannel) => {
  try {
    const targetNorm = normalizeChannel(targetChannel);
    let foundCid = null;
    for (const entry of zipEntries) {
      if (entry.entryName === 'channel.csv') {
        const csvContent = entry.getData().toString('utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            const cnameNorm = normalizeChannel(row['CName']);
            const cid = (row['CID'] || '').toString().trim();
            if (cnameNorm === targetNorm || normalizeChannel(cid) === targetNorm) {
              return cid;
            }
          }
        }
      }
    }
    return foundCid;
  } catch (_err) {
    return null;
  }
};
