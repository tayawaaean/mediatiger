const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3002;
const API_VERSION = 'v1';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables:');
    console.error('   SUPABASE_URL and SUPABASE_ANON_KEY are required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: 'Final Analytics API',
        version: '1.0.0',
        port: PORT,
        supabase: 'Connected'
    });
});

// API Routes
const apiRouter = express.Router();

// Get analytics data with filtering options
apiRouter.get('/analytics', async (req, res) => {
    try {
        const {
            channel_id,
            start_date,
            end_date,
            limit = 100,
            offset = 0,
            sort_by = 'scraped_at',
            sort_order = 'desc'
        } = req.query;

        console.log('🔍 Analytics request:', { channel_id, start_date, end_date, limit, offset });

        // Build query
        let query = supabase
            .from('analytics_data')
            .select('*')
            .order(sort_by, { ascending: sort_order === 'asc' })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        // Apply filters
        if (channel_id) {
            query = query.eq('channel_id', channel_id);
        }

        if (start_date) {
            query = query.gte('start_date', start_date);
        }

        if (end_date) {
            query = query.lte('end_date', end_date);
        }

        // Execute query
        const { data, error, count } = await query;

        if (error) {
            console.error('❌ Supabase query error:', error);
            return res.status(500).json({
                success: false,
                error: 'Database query failed',
                details: error.message
            });
        }

        // Get total count for pagination
        let totalCount = 0;
        if (count !== null) {
            totalCount = count;
        } else {
            // Fallback count query
            let countQuery = supabase.from('analytics_data').select('*', { count: 'exact', head: true });
            if (channel_id) countQuery = countQuery.eq('channel_id', channel_id);
            if (start_date) countQuery = countQuery.gte('start_date', start_date);
            if (end_date) countQuery = countQuery.lte('end_date', end_date);
            
            const { count: fallbackCount } = await countQuery;
            totalCount = fallbackCount || 0;
        }

        console.log(`✅ Retrieved ${data.length} records from Supabase`);

        res.status(200).json({
            success: true,
            data: data || [],
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            },
            filters: {
                channel_id: channel_id || 'all',
                start_date: start_date || 'all',
                end_date: end_date || 'all'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('💥 Analytics endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Get analytics summary for dashboard
apiRouter.get('/analytics/summary', async (req, res) => {
    try {
        const { channel_id, start_date, end_date } = req.query;

        console.log('📊 Summary request:', { channel_id, start_date, end_date });

        // Build base query
        let query = supabase
            .from('analytics_data')
            .select('channel_id, total_views, total_premium_views, total_revenue, average_rpm, start_date, end_date');

        // Apply filters
        if (channel_id) {
            query = query.eq('channel_id', channel_id);
        }

        if (start_date) {
            query = query.gte('start_date', start_date);
        }

        if (end_date) {
            query = query.lte('end_date', end_date);
        }

        const { data, error } = await query;

        if (error) {
            console.error('❌ Summary query error:', error);
            return res.status(500).json({
                success: false,
                error: 'Database query failed',
                details: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(200).json({
                success: true,
                summary: {
                    totalViews: 0,
                    totalPremiumViews: 0,
                    totalRevenue: 0,
                    averageRPM: 0,
                    dataPoints: 0,
                    channels: 0
                },
                message: 'No data found for the specified criteria'
            });
        }

        // Calculate summary metrics
        const summary = {
            totalViews: data.reduce((sum, record) => sum + (record.total_views || 0), 0),
            totalPremiumViews: data.reduce((sum, record) => sum + (record.total_premium_views || 0), 0),
            totalRevenue: data.reduce((sum, record) => sum + (parseFloat(record.total_revenue) || 0), 0),
            averageRPM: data.reduce((sum, record) => sum + (parseFloat(record.average_rpm) || 0), 0) / data.length,
            dataPoints: data.length,
            channels: new Set(data.map(record => record.channel_id)).size
        };

        // Round revenue and RPM
        summary.totalRevenue = Math.round(summary.totalRevenue * 100) / 100;
        summary.averageRPM = Math.round(summary.averageRPM * 100) / 100;

        console.log(`✅ Summary calculated: ${summary.totalViews} views, $${summary.totalRevenue} revenue`);

        res.status(200).json({
            success: true,
            summary,
            filters: {
                channel_id: channel_id || 'all',
                start_date: start_date || 'all',
                end_date: end_date || 'all'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('💥 Summary endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Get channel list with analytics summary
apiRouter.get('/channels', async (req, res) => {
    try {
        const { include_analytics = 'false' } = req.query;

        console.log('📋 Channels request:', { include_analytics });

        if (include_analytics === 'true') {
            // Get channels with analytics data
            const { data, error } = await supabase
                .from('analytics_data')
                .select('channel_id, total_views, total_premium_views, total_revenue, average_rpm, start_date, end_date')
                .order('channel_id');

            if (error) {
                throw new Error(`Database query failed: ${error.message}`);
            }

            // Group by channel and calculate totals
            const channelMap = new Map();
            data.forEach(record => {
                if (!channelMap.has(record.channel_id)) {
                    channelMap.set(record.channel_id, {
                        channel_id: record.channel_id,
                        total_views: 0,
                        total_premium_views: 0,
                        total_revenue: 0,
                        average_rpm: 0,
                        data_points: 0,
                        first_seen: record.start_date,
                        last_seen: record.end_date
                    });
                }

                const channel = channelMap.get(record.channel_id);
                channel.total_views += record.total_views || 0;
                channel.total_premium_views += record.total_premium_views || 0;
                channel.total_revenue += parseFloat(record.total_revenue) || 0;
                channel.data_points += 1;

                // Update date range
                if (record.start_date < channel.first_seen) {
                    channel.first_seen = record.start_date;
                }
                if (record.end_date > channel.last_seen) {
                    channel.last_seen = record.end_date;
                }
            });

            // Calculate average RPM for each channel
            channelMap.forEach(channel => {
                channel.average_rpm = channel.total_views > 0 ? 
                    (channel.total_revenue * 1000) / channel.total_views : 0;
                channel.total_revenue = Math.round(channel.total_revenue * 100) / 100;
                channel.average_rpm = Math.round(channel.average_rpm * 100) / 100;
            });

            const channels = Array.from(channelMap.values());

            console.log(`✅ Retrieved ${channels.length} channels with analytics`);

            res.status(200).json({
                success: true,
                channels,
                total: channels.length,
                timestamp: new Date().toISOString()
            });

        } else {
            // Get just unique channel IDs
            const { data, error } = await supabase
                .from('analytics_data')
                .select('channel_id')
                .order('channel_id');

            if (error) {
                throw new Error(`Database query failed: ${error.message}`);
            }

            const channels = [...new Set(data.map(record => record.channel_id))];

            console.log(`✅ Retrieved ${channels.length} unique channels`);

            res.status(200).json({
                success: true,
                channels: channels.map(id => ({ channel_id: id })),
                total: channels.length,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('💥 Channels endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Get daily analytics for charts
apiRouter.get('/analytics/daily', async (req, res) => {
    try {
        const { channel_id, start_date, end_date, group_by = 'date' } = req.query;

        console.log('📈 Daily analytics request:', { channel_id, start_date, end_date, group_by });

        // Build query
        let query = supabase
            .from('analytics_data')
            .select('start_date, end_date, total_views, total_premium_views, total_revenue, average_rpm, channel_id')
            .order('start_date', { ascending: true });

        // Apply filters
        if (channel_id) {
            query = query.eq('channel_id', channel_id);
        }

        if (start_date) {
            query = query.gte('start_date', start_date);
        }

        if (end_date) {
            query = query.lte('end_date', end_date);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Database query failed: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return res.status(200).json({
                success: true,
                daily_data: [],
                message: 'No daily data found for the specified criteria'
            });
        }

        // Group data by date or channel based on group_by parameter
        let groupedData;
        if (group_by === 'channel') {
            // Group by channel
            const channelMap = new Map();
            data.forEach(record => {
                if (!channelMap.has(record.channel_id)) {
                    channelMap.set(record.channel_id, {
                        channel_id: record.channel_id,
                        dates: [],
                        total_views: 0,
                        total_premium_views: 0,
                        total_revenue: 0
                    });
                }

                const channel = channelMap.get(record.channel_id);
                channel.dates.push({
                    date: record.start_date,
                    views: record.total_views || 0,
                    premium_views: record.total_premium_views || 0,
                    revenue: parseFloat(record.total_revenue) || 0,
                    rpm: parseFloat(record.average_rpm) || 0
                });

                channel.total_views += record.total_views || 0;
                channel.total_premium_views += record.total_premium_views || 0;
                channel.total_revenue += parseFloat(record.total_revenue) || 0;
            });

            groupedData = Array.from(channelMap.values());
        } else {
            // Group by date (default)
            const dateMap = new Map();
            data.forEach(record => {
                const date = record.start_date;
                if (!dateMap.has(date)) {
                    dateMap.set(date, {
                        date,
                        channels: [],
                        total_views: 0,
                        total_premium_views: 0,
                        total_revenue: 0
                    });
                }

                const dateData = dateMap.get(date);
                dateData.channels.push({
                    channel_id: record.channel_id,
                    views: record.total_views || 0,
                    premium_views: record.total_premium_views || 0,
                    revenue: parseFloat(record.total_revenue) || 0,
                    rpm: parseFloat(record.average_rpm) || 0
                });

                dateData.total_views += record.total_views || 0;
                dateData.total_premium_views += record.total_premium_views || 0;
                dateData.total_revenue += parseFloat(record.total_revenue) || 0;
            });

            groupedData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        }

        console.log(`✅ Retrieved daily data: ${groupedData.length} ${group_by} entries`);

        res.status(200).json({
            success: true,
            daily_data: groupedData,
            group_by,
            filters: {
                channel_id: channel_id || 'all',
                start_date: start_date || 'all',
                end_date: end_date || 'all'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('💥 Daily analytics endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Mount API routes
app.use(`/api/${API_VERSION}`, apiRouter);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /health',
            'GET /api/v1/analytics',
            'GET /api/v1/analytics/summary',
            'GET /api/v1/analytics/daily',
            'GET /api/v1/channels'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Final Analytics API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 API Base: http://localhost:${PORT}/api/${API_VERSION}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET /api/${API_VERSION}/analytics - Get analytics data with filters`);
    console.log(`   GET /api/${API_VERSION}/analytics/summary - Get summary metrics`);
    console.log(`   GET /api/${API_VERSION}/analytics/daily - Get daily data for charts`);
    console.log(`   GET /api/${API_VERSION}/channels - Get channel list`);
    console.log(`\n💡 Example usage:`);
    console.log(`   GET /api/${API_VERSION}/analytics?channel_id=UCmSy2p4qeO3cr_BPCF4oSeQ&start_date=2025-05-01&end_date=2025-05-31`);
    console.log(`   GET /api/${API_VERSION}/analytics/summary?start_date=2025-05-01&end_date=2025-05-31`);
    console.log(`   GET /api/${API_VERSION}/analytics/daily?channel_id=UCmSy2p4qeO3cr_BPCF4oSeQ&group_by=date`);
});
