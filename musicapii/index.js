const https = require('https');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: '/home/ubuntu/backend/.env' });

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const PLAYIST_ENDPOINTS = {
  MUSIC_LIST: '/public/v1/music/list'
};

const { PLAYIST_API_URL, PLAYIST_API_KEY, FRONTEND_URL, PORT } = process.env;

console.log('Loaded ENV:', {
  PLAYIST_API_URL: PLAYIST_API_URL || 'Not set',
  PLAYIST_API_KEY: PLAYIST_API_KEY ? 'Set (length: ' + PLAYIST_API_KEY.length + ')' : 'Not set',
  FRONTEND_URL: FRONTEND_URL || 'Not set',
  PORT,
});

const app = express();
app.use(cors());
app.use(express.json());

const searchSessions = new Map();
const apiCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;
const apiCallTimestamps = new Map();
const API_RATE_LIMIT_MS = 1000;
const rateLimitBackoff = new Map();

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

const rateLimitedApiCall = async (key, apiCallFunction, retryCount = 0) => {
  const lastCall = apiCallTimestamps.get(key) || 0;
  const now = Date.now();
  const timeSinceLastCall = now - lastCall;
  const currentBackoff = rateLimitBackoff.get(key) || API_RATE_LIMIT_MS;
  
  if (timeSinceLastCall < currentBackoff) {
    await new Promise(resolve => setTimeout(resolve, currentBackoff - timeSinceLastCall));
  }
  
  apiCallTimestamps.set(key, Date.now());
  
  try {
    const result = await apiCallFunction();
    rateLimitBackoff.set(key, API_RATE_LIMIT_MS);
    return result;
  } catch (error) {
    if (error.response?.status === 429 && key.includes('analytics')) {
      throw error;
    }
    
    if (error.response?.status === 429 && retryCount < 3) {
      const newBackoff = Math.min(currentBackoff * 2, 30000);
      rateLimitBackoff.set(key, newBackoff);
      await new Promise(resolve => setTimeout(resolve, newBackoff));
      return rateLimitedApiCall(key, apiCallFunction, retryCount + 1);
    }
    throw error;
  }
};

const formatTrack = (item) => ({
  id: item.isrc || 'unknown',
  title: item.name || 'Untitled',
  artist: item.artist || 'Unknown Artist',
  cover: item.thumbnail || 'https://via.placeholder.com/100',
  duration: item.duration || '0:00',
  favorite: false,
  category: item.tags ? item.tags.map((tag) => tag.name.toLowerCase()) : [],
  music: item.music || '',
});



app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/music', async (req, res) => {
  const { page = 1, size = 15, search, mood } = req.body || {};

  if (!PLAYIST_API_URL || !PLAYIST_API_KEY) {
    return res.status(500).json({
      error: 'Server configuration error: Missing Playist API credentials.',
    });
  }

  try {
    if (!search && !mood) {
      const cacheKey = `music-list-page:${page}-size:${size}`;
      const cachedResponse = getCachedResponse(cacheKey);
      
      if (cachedResponse) {
        const tracks = (cachedResponse.datas || []).map(formatTrack);
        return res.status(200).json({
          success: true,
          tracks,
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
        const tracks = (response.data.datas || []).map(formatTrack);
        
        // Debug logging
        console.log(`Page ${page}: Got ${tracks.length} tracks, Total available: ${response.data.total || 'unknown'}, Has next: ${response.data.page_data?.next?.length > 0}`);
        console.log('Page data:', JSON.stringify(response.data.page_data, null, 2));
        
        // Calculate if there are more items
        const currentTotal = (page - 1) * size + tracks.length;
        const totalAvailable = response.data.total || response.data.page_data?.total;
        const hasMoreFromAPI = response.data.page_data?.next?.length > 0;
        const hasMoreFromTotal = totalAvailable ? currentTotal < totalAvailable : hasMoreFromAPI;
        
        return res.status(200).json({
          success: true,
          tracks,
          hasMore: hasMoreFromTotal,
          totalAvailable: totalAvailable,
          currentTotal: currentTotal,
        });
      }

      return res.status(400).json({
        error: response.data.message || 'Failed to fetch music tracks from Playist',
      });
    }

    // Handle combined search and mood filtering
    if (search && mood) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const sessionKey = `${clientIp}-search-${search.toLowerCase()}-mood-${mood.toLowerCase()}`;
      let session = searchSessions.get(sessionKey);

      if (page === 1 || !session) {
        session = {
          search: search.toLowerCase(),
          mood: mood.toLowerCase(),
          foundTracks: [],
          lastApiPage: 0,
          isComplete: false,
          lastAccessed: Date.now(),
          searchedCount: 0,
          totalAvailable: undefined,
        };
        searchSessions.set(sessionKey, session);
      }
      
      session.lastAccessed = Date.now();
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      let MAX_SEARCH_PAGES = 20; // Initial value, will be adjusted based on total available
      
      while (!session.isComplete && session.lastApiPage < MAX_SEARCH_PAGES) {
        const needMoreResults = session.foundTracks.length < endIndex;
        const hasTotal = session.totalAvailable !== undefined;
        const searchedAll = hasTotal && session.searchedCount >= session.totalAvailable;
        
        if (!needMoreResults && searchedAll) break;
        
        session.lastApiPage++;
        const searchPageSize = 100; // Use consistent page size for all API calls
        const apiPageParam = session.lastApiPage - 1;
        const apiCacheKey = `music-api-page:${apiPageParam}-size:${searchPageSize}`;
        
        let apiResponse;
        const cachedApiResponse = getCachedResponse(apiCacheKey);
        
        if (cachedApiResponse) {
          apiResponse = { data: cachedApiResponse };
        } else {
          apiResponse = await rateLimitedApiCall(`playist-api-${clientIp}`, async () => {
            const musicListUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.MUSIC_LIST}`;
            const response = await axios.get(musicListUrl, {
              headers: {
                'ZS-API-Auth': PLAYIST_API_KEY,
                'Accept-Language': 'en',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Lightsail-Proxy/1.0',
              },
              params: { page: apiPageParam, size: searchPageSize },
              timeout: 10000,
            });
            
            if (response.data.success && response.data.response_code === 0) {
              setCacheResponse(apiCacheKey, response.data);
            }
            
            return response;
          });
        }

        if (apiResponse.data.success && apiResponse.data.response_code === 0) {
          console.log(`Search + Mood filter - API Page ${apiPageParam}: Received ${apiResponse.data.datas.length} items`);
          session.searchedCount += apiResponse.data.datas.length;
          
          if (apiResponse.data.total !== undefined) {
            session.totalAvailable = apiResponse.data.total;
          } else if (apiResponse.data.page_data?.total !== undefined) {
            session.totalAvailable = apiResponse.data.page_data.total;
          }
          
          if (session.totalAvailable && session.lastApiPage === 1) {
            // All pages now use 100 items per page
            const totalPagesNeeded = Math.ceil(session.totalAvailable / 100);
            MAX_SEARCH_PAGES = totalPagesNeeded;
            console.log(`Search + Mood filter - Total available: ${session.totalAvailable}, Pages needed: ${totalPagesNeeded}`);
          }

          const matches = apiResponse.data.datas
            .filter((track) => {
              const searchLower = session.search;
              const moodLower = session.mood;
              // Check if track matches mood
              const moodMatch = track.tags?.some((tag) => 
                tag.name.toLowerCase() === moodLower
              );
              // Check if track matches search term
              const nameMatch = track.name?.toLowerCase().includes(searchLower);
              const artistMatch = track.artist?.toLowerCase().includes(searchLower);
              const tagMatch = track.tags?.some((tag) => 
                tag.name.toLowerCase().includes(searchLower)
              );
              const searchMatch = nameMatch || artistMatch || tagMatch;
              // Both conditions must be true
              return moodMatch && searchMatch;
            })
            .map(formatTrack);

          session.foundTracks.push(...matches);
          
          console.log(`Search + Mood filter - Page ${session.lastApiPage}: Found ${matches.length} matches, Total found so far: ${session.foundTracks.length}, Searched through: ${session.searchedCount}/${session.totalAvailable || 'unknown'}`);

          const receivedLessThanRequested = apiResponse.data.datas.length < searchPageSize;
          const hasMorePages = apiResponse.data.page_data.next && apiResponse.data.page_data.next.length > 0;
          
          // Only mark as complete if we've truly searched everything or hit a hard limit
          if (apiResponse.data.datas.length === 0) {
            console.log(`Search + Mood filter - No more data from API, stopping`);
            session.isComplete = true;
          } else if (session.totalAvailable && session.searchedCount >= session.totalAvailable) {
            console.log(`Search + Mood filter - Searched all ${session.totalAvailable} items, stopping search`);
            session.isComplete = true;
          } else if (session.lastApiPage >= MAX_SEARCH_PAGES) {
            console.log(`Search + Mood filter - Reached max pages limit (${MAX_SEARCH_PAGES}), stopping`);
            session.isComplete = true;
          } else if (!hasMorePages && session.totalAvailable === undefined) {
            // Only stop if API says no more pages AND we don't know the total
            console.log(`Search + Mood filter - API says no more pages and total unknown, stopping`);
            session.isComplete = true;
          }

          if (session.foundTracks.length >= endIndex && 
              session.totalAvailable && session.searchedCount >= session.totalAvailable) {
            break;
          }
        } else {
          session.isComplete = true;
          break;
        }
      }

      const paginatedResults = session.foundTracks.slice(startIndex, endIndex);
      const hasMore = session.foundTracks.length > endIndex || !session.isComplete;

      return res.status(200).json({
        success: true,
        tracks: paginatedResults,
        hasMore,
        searchInfo: {
          totalFound: session.foundTracks.length,
          searchComplete: session.isComplete,
          totalAvailable: session.totalAvailable,
          searchedThrough: session.searchedCount,
        },
      });
    }

    // Handle mood-based filtering only
    if (mood && !search) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const sessionKey = `${clientIp}-mood-${mood.toLowerCase()}`;
      let session = searchSessions.get(sessionKey);

      if (page === 1 || !session) {
        session = {
          mood: mood.toLowerCase(),
          foundTracks: [],
          lastApiPage: 0,
          isComplete: false,
          lastAccessed: Date.now(),
          searchedCount: 0,
          totalAvailable: undefined,
        };
        searchSessions.set(sessionKey, session);
      }
      
      session.lastAccessed = Date.now();
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      let MAX_SEARCH_PAGES = 20; // Initial value, will be adjusted based on total available
      
      while (!session.isComplete && session.lastApiPage < MAX_SEARCH_PAGES) {
        const needMoreResults = session.foundTracks.length < endIndex;
        const hasTotal = session.totalAvailable !== undefined;
        const searchedAll = hasTotal && session.searchedCount >= session.totalAvailable;
        
        if (!needMoreResults && searchedAll) break;
        
        session.lastApiPage++;
        const searchPageSize = 100; // Use consistent page size for all API calls
        const apiPageParam = session.lastApiPage - 1;
        const apiCacheKey = `music-api-page:${apiPageParam}-size:${searchPageSize}`;
        
        let apiResponse;
        const cachedApiResponse = getCachedResponse(apiCacheKey);
        
        if (cachedApiResponse) {
          apiResponse = { data: cachedApiResponse };
        } else {
          apiResponse = await rateLimitedApiCall(`playist-api-${clientIp}`, async () => {
            const musicListUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.MUSIC_LIST}`;
            const response = await axios.get(musicListUrl, {
              headers: {
                'ZS-API-Auth': PLAYIST_API_KEY,
                'Accept-Language': 'en',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Lightsail-Proxy/1.0',
              },
              params: { page: apiPageParam, size: searchPageSize },
              timeout: 10000,
            });
            
            if (response.data.success && response.data.response_code === 0) {
              setCacheResponse(apiCacheKey, response.data);
            }
            
            return response;
          });
        }

        if (apiResponse.data.success && apiResponse.data.response_code === 0) {
          console.log(`Mood filter - API Page ${apiPageParam}: Received ${apiResponse.data.datas.length} items`);
          session.searchedCount += apiResponse.data.datas.length;
          
          if (apiResponse.data.total !== undefined) {
            session.totalAvailable = apiResponse.data.total;
          } else if (apiResponse.data.page_data?.total !== undefined) {
            session.totalAvailable = apiResponse.data.page_data.total;
          }
          
          if (session.totalAvailable && session.lastApiPage === 1) {
            // All pages now use 100 items per page
            const totalPagesNeeded = Math.ceil(session.totalAvailable / 100);
            MAX_SEARCH_PAGES = totalPagesNeeded;
            console.log(`Mood filter - Total available: ${session.totalAvailable}, Pages needed: ${totalPagesNeeded}`);
          }

          const matches = apiResponse.data.datas
            .filter((track) => {
              const moodLower = session.mood;
              const tagMatch = track.tags?.some((tag) => 
                tag.name.toLowerCase() === moodLower
              );
              return tagMatch;
            })
            .map(formatTrack);

          session.foundTracks.push(...matches);
          
          console.log(`Mood filter - Page ${session.lastApiPage}: Found ${matches.length} matches, Total found so far: ${session.foundTracks.length}, Searched through: ${session.searchedCount}/${session.totalAvailable || 'unknown'}`);

          const receivedLessThanRequested = apiResponse.data.datas.length < searchPageSize;
          const hasMorePages = apiResponse.data.page_data.next && apiResponse.data.page_data.next.length > 0;
          
          // Only mark as complete if we've truly searched everything or hit a hard limit
          if (apiResponse.data.datas.length === 0) {
            console.log(`Mood filter - No more data from API, stopping`);
            session.isComplete = true;
          } else if (session.totalAvailable && session.searchedCount >= session.totalAvailable) {
            console.log(`Mood filter - Searched all ${session.totalAvailable} items, stopping search`);
            session.isComplete = true;
          } else if (session.lastApiPage >= MAX_SEARCH_PAGES) {
            console.log(`Mood filter - Reached max pages limit (${MAX_SEARCH_PAGES}), stopping`);
            session.isComplete = true;
          } else if (!hasMorePages && session.totalAvailable === undefined) {
            // Only stop if API says no more pages AND we don't know the total
            console.log(`Mood filter - API says no more pages and total unknown, stopping`);
            session.isComplete = true;
          }

          if (session.foundTracks.length >= endIndex && 
              session.totalAvailable && session.searchedCount >= session.totalAvailable) {
            break;
          }
        } else {
          session.isComplete = true;
          break;
        }
      }

      const paginatedResults = session.foundTracks.slice(startIndex, endIndex);
      const hasMore = session.foundTracks.length > endIndex || !session.isComplete;

      return res.status(200).json({
        success: true,
        tracks: paginatedResults,
        hasMore,
        moodInfo: {
          totalFound: session.foundTracks.length,
          searchComplete: session.isComplete,
          totalAvailable: session.totalAvailable,
          searchedThrough: session.searchedCount,
        },
      });
    }

    // Handle search only (without mood)
    if (search && !mood) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const sessionKey = `${clientIp}-${search.toLowerCase()}`;
      let session = searchSessions.get(sessionKey);

      if (page === 1 || !session) {
        session = {
          search: search.toLowerCase(),
          foundTracks: [],
          lastApiPage: 0,
          isComplete: false,
          lastAccessed: Date.now(),
          searchedCount: 0,
          totalAvailable: undefined,
        };
        searchSessions.set(sessionKey, session);
      }
      
      session.lastAccessed = Date.now();
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      let MAX_SEARCH_PAGES = 20; // Initial value, will be adjusted based on total available
      
      while (!session.isComplete && session.lastApiPage < MAX_SEARCH_PAGES) {
      const needMoreResults = session.foundTracks.length < endIndex;
      const hasTotal = session.totalAvailable !== undefined;
      const searchedAll = hasTotal && session.searchedCount >= session.totalAvailable;
      
      if (!needMoreResults && searchedAll) break;
      
      session.lastApiPage++;
      const searchPageSize = 100; // Use consistent page size for all API calls
      const apiPageParam = session.lastApiPage - 1;
      const apiCacheKey = `music-api-page:${apiPageParam}-size:${searchPageSize}`;
      
      let apiResponse;
      const cachedApiResponse = getCachedResponse(apiCacheKey);
      
      if (cachedApiResponse) {
        apiResponse = { data: cachedApiResponse };
      } else {
        apiResponse = await rateLimitedApiCall(`playist-api-${clientIp}`, async () => {
          const musicListUrl = `${PLAYIST_API_URL}${PLAYIST_ENDPOINTS.MUSIC_LIST}`;
          const response = await axios.get(musicListUrl, {
            headers: {
              'ZS-API-Auth': PLAYIST_API_KEY,
              'Accept-Language': 'en',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'Lightsail-Proxy/1.0',
            },
            params: { page: apiPageParam, size: searchPageSize },
            timeout: 10000,
          });
          
          if (response.data.success && response.data.response_code === 0) {
            setCacheResponse(apiCacheKey, response.data);
          }
          
          return response;
        });
      }

      if (apiResponse.data.success && apiResponse.data.response_code === 0) {
        console.log(`Search - API Page ${apiPageParam}: Received ${apiResponse.data.datas.length} items`);
        session.searchedCount += apiResponse.data.datas.length;
        
        if (apiResponse.data.total !== undefined) {
          session.totalAvailable = apiResponse.data.total;
        } else if (apiResponse.data.page_data?.total !== undefined) {
          session.totalAvailable = apiResponse.data.page_data.total;
        }
        
        if (session.totalAvailable && session.lastApiPage === 1) {
          // All pages now use 100 items per page
          const totalPagesNeeded = Math.ceil(session.totalAvailable / 100);
          MAX_SEARCH_PAGES = totalPagesNeeded;
          console.log(`Search - Total available: ${session.totalAvailable}, Pages needed: ${totalPagesNeeded}`);
        }

        const matches = apiResponse.data.datas
          .filter((track) => {
            const searchLower = session.search;
            const nameMatch = track.name?.toLowerCase().includes(searchLower);
            const artistMatch = track.artist?.toLowerCase().includes(searchLower);
            const tagMatch = track.tags?.some((tag) => 
              tag.name.toLowerCase().includes(searchLower)
            );
            return nameMatch || artistMatch || tagMatch;
          })
          .map(formatTrack);

        session.foundTracks.push(...matches);
        
        console.log(`Search - Page ${session.lastApiPage}: Found ${matches.length} matches, Total found so far: ${session.foundTracks.length}, Searched through: ${session.searchedCount}/${session.totalAvailable || 'unknown'}`);

        const receivedLessThanRequested = apiResponse.data.datas.length < searchPageSize;
        const hasMorePages = apiResponse.data.page_data.next && apiResponse.data.page_data.next.length > 0;
        
        // Only mark as complete if we've truly searched everything or hit a hard limit
        if (apiResponse.data.datas.length === 0) {
          console.log(`Search - No more data from API, stopping`);
          session.isComplete = true;
        } else if (session.totalAvailable && session.searchedCount >= session.totalAvailable) {
          console.log(`Search - Searched all ${session.totalAvailable} items, stopping search`);
          session.isComplete = true;
        } else if (session.lastApiPage >= MAX_SEARCH_PAGES) {
          console.log(`Search - Reached max pages limit (${MAX_SEARCH_PAGES}), stopping`);
          session.isComplete = true;
        } else if (!hasMorePages && session.totalAvailable === undefined) {
          // Only stop if API says no more pages AND we don't know the total
          console.log(`Search - API says no more pages and total unknown, stopping`);
          session.isComplete = true;
        }

        if (session.foundTracks.length >= endIndex && 
            session.totalAvailable && session.searchedCount >= session.totalAvailable) {
          break;
        }
      } else {
        session.isComplete = true;
        break;
      }
      }

      const paginatedResults = session.foundTracks.slice(startIndex, endIndex);
      const hasMore = session.foundTracks.length > endIndex || !session.isComplete;

      return res.status(200).json({
      success: true,
      tracks: paginatedResults,
      hasMore,
      searchInfo: {
        totalFound: session.foundTracks.length,
        searchComplete: session.isComplete,
        totalAvailable: session.totalAvailable,
        searchedThrough: session.searchedCount,
        },
      });
    }
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



app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Lightsail Analytics Proxy'
  });
});

const httpsServer = https.createServer(options, app);

httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server running on https://0.0.0.0:${PORT}`);
  console.log(`Health check available at https://0.0.0.0:${PORT}/health`);
  console.log(`External access: https://18.142.174.87:${PORT}`);
});
