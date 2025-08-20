const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const API_BASE_URL = 'http://18.142.174.87:3001';
const OUTPUT_DIR = './scraped-data';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables:');
    console.error('   SUPABASE_URL and SUPABASE_ANON_KEY are required');
    console.error('   Add them to your .env file or environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
console.log(`🔌 Testing Supabase connection to: ${supabaseUrl}`);
console.log(`🔑 Using key: ${supabaseKey.substring(0, 20)}...`);

// Function to test Supabase connection
async function testSupabaseConnection() {
    try {
        console.log(`🔍 Testing basic Supabase connection...`);
        
        // Test 1: Basic client creation
        console.log(`✅ Supabase client created successfully`);
        
        // Test 2: Try to access a non-existent table (this should work and return an error about the table not existing)
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
        
        if (error) {
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log(`✅ Supabase connection successful - client can reach the database`);
                console.log(`🔍 Connection test result:`, { 
                    error: error.message, 
                    code: error.code, 
                    details: error.details,
                    status: 'Connection working, table missing (expected)'
                });
            } else {
                console.log(`⚠️  Supabase connection test returned unexpected error:`, { 
                    error: error.message, 
                    code: error.code, 
                    details: error.details 
                });
            }
        } else {
            console.log(`✅ Supabase connection successful - unexpected success`);
        }
    } catch (connectionError) {
        console.log(`❌ Connection test failed:`, connectionError.message);
        console.log(`🔍 This might indicate a network, authentication, or configuration issue`);
    }
}

// Test connection (but don't await it here since we're not in an async context)
testSupabaseConnection().catch(console.error);

// Utility function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Utility function to generate date range
const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }
    
    return dates;
};

// Function to save data to Supabase
async function saveToSupabase(data, channelId, startDate, endDate, options = {}) {
    const {
        tableName = 'analytics_data',
        upsert = true,
        verbose = true
    } = options;

    try {
        if (verbose) {
            console.log(`🗄️  Saving data to Supabase table: ${tableName}`);
        }

        // Prepare the data for Supabase
        const supabaseData = {
            channel_id: channelId,
            start_date: startDate,
            end_date: endDate,
            scraped_at: new Date().toISOString(),
            api_endpoint: `${API_BASE_URL}/api/analytics/range`,
            
            // Summary metrics
            total_views: data.summary?.totalViews || 0,
            total_premium_views: data.summary?.totalPremiumViews || 0,
            total_revenue: data.summary?.totalRevenue || 0,
            average_rpm: data.summary?.averageRPM || 0,
            data_points: data.summary?.dataPoints || 0,
            data_availability: data.summary?.dataAvailability || 0,
            success_rate: data.summary?.successRate || 0,
            
            // Daily data (as JSON)
            daily_data: data.dailyData || [],
            
            // Raw response data
            raw_data: data,
            
            // Metadata
            status: data.status || 'completed',
            notice: data.notice || '',
            implementation: data.implementation || ''
        };

        let result;
        if (upsert) {
            // Use upsert to avoid duplicates
            result = await supabase
                .from(tableName)
                .upsert(supabaseData, {
                    onConflict: 'channel_id,start_date,end_date',
                    ignoreDuplicates: false
                });
        } else {
            // Insert new record
            result = await supabase
                .from(tableName)
                .insert(supabaseData);
        }

        if (result.error) {
            throw new Error(`Supabase error: ${result.error.message}`);
        }

        if (verbose) {
            console.log(`✅ Data saved to Supabase successfully`);
            if (result.data) {
                console.log(`📊 Record ID: ${result.data[0]?.id || 'N/A'}`);
            }
        }

        return result;

    } catch (error) {
        console.error(`❌ Error saving to Supabase:`, error.message);
        throw error;
    }
}

// Function to create analytics table if it doesn't exist
async function ensureAnalyticsTable(tableName = 'analytics_data', options = {}) {
    const { verbose = false, createIfMissing = false } = options;
    try {
        console.log(`🔧 Ensuring analytics table exists: ${tableName}`);
        
        // Simple approach: try to select from the table to check if it exists
        const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);

        if (error) {
            const errorMessage = error.message || '';
            const errorCode = error.code || '';
            
            if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
                console.log(`📋 Table ${tableName} doesn't exist. Please create it manually with this SQL:`);
                console.log(`
CREATE TABLE ${tableName} (
    id BIGSERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    scraped_at TIMESTAMPTZ NOT NULL,
    api_endpoint TEXT,
    total_views BIGINT DEFAULT 0,
    total_premium_views BIGINT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rpm DECIMAL(10,4) DEFAULT 0,
    data_points INTEGER DEFAULT 0,
    data_availability INTEGER DEFAULT 0,
    success_rate INTEGER DEFAULT 0,
    daily_data JSONB,
    raw_data JSONB,
    status TEXT,
    notice TEXT,
    implementation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, start_date, end_date)
);

-- Create indexes for better performance
CREATE INDEX idx_${tableName}_channel_id ON ${tableName}(channel_id);
CREATE INDEX idx_${tableName}_date_range ON ${tableName}(start_date, end_date);
CREATE INDEX idx_${tableName}_scraped_at ON ${tableName}(scraped_at);
                `);
                throw new Error(`Table ${tableName} doesn't exist. Please create it first.`);
            } else if (errorCode === 'PGRST116') {
                throw new Error(`Authentication failed. Check your Supabase key and permissions.`);
            } else if (errorCode === 'PGRST301') {
                throw new Error(`Table ${tableName} access denied. Check your RLS policies.`);
            } else if (createIfMissing && errorCode === '42P01') {
                // Table doesn't exist and we want to create it
                console.log(`📋 Table ${tableName} doesn't exist. Attempting to create it...`);
                try {
                    await createAnalyticsTable(tableName);
                    console.log(`✅ Table ${tableName} created successfully`);
                    return true;
                } catch (createError) {
                    throw new Error(`Failed to create table: ${createError.message}`);
                }
            } else {
                // Handle other Supabase errors
                throw new Error(`Supabase error (${errorCode}): ${errorMessage || 'Unknown error'}`);
            }
        }

        // Table exists and is accessible
        console.log(`✅ Table ${tableName} is ready`);
        return true;

    } catch (error) {
        console.error(`❌ Table setup failed:`, error.message);
        throw error;
    }
}

// Function to create the analytics table
async function createAnalyticsTable(tableName = 'analytics_data') {
    try {
        console.log(`🔨 Creating table: ${tableName}`);
        
        // Try to create the table using SQL execution
        // Note: This requires the service_role key or proper permissions
        const createTableSQL = `
CREATE TABLE IF NOT EXISTS ${tableName} (
    id BIGSERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    scraped_at TIMESTAMPTZ NOT NULL,
    api_endpoint TEXT,
    total_views BIGINT DEFAULT 0,
    total_premium_views BIGINT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rpm DECIMAL(10,4) DEFAULT 0,
    data_points INTEGER DEFAULT 0,
    data_availability INTEGER DEFAULT 0,
    success_rate INTEGER DEFAULT 0,
    daily_data JSONB,
    raw_data JSONB,
    status TEXT,
    notice TEXT,
    implementation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, start_date, end_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_${tableName}_channel_id ON ${tableName}(channel_id);
CREATE INDEX IF NOT EXISTS idx_${tableName}_date_range ON ${tableName}(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_${tableName}_scraped_at ON ${tableName}(scraped_at);
        `;
        
        console.log(`📋 Attempting to create table using SQL...`);
        
        // Try to execute the SQL using Supabase's rpc function
        // This might not work with anon key, so we'll show the SQL as fallback
        try {
            const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
            
            if (error) {
                console.log(`⚠️  RPC execution failed: ${error.message}`);
                console.log(`📋 Please run this SQL manually in your Supabase SQL editor:`);
                console.log(createTableSQL);
                throw new Error(`Table creation requires manual SQL execution. Please run the SQL above in your Supabase dashboard.`);
            } else {
                console.log(`✅ Table ${tableName} created successfully via RPC`);
                return true;
            }
        } catch (rpcError) {
            console.log(`📋 RPC not available, please run this SQL manually in your Supabase SQL editor:`);
            console.log(createTableSQL);
            throw new Error(`Table creation requires manual SQL execution. Please run the SQL above in your Supabase dashboard.`);
        }
        
    } catch (error) {
        console.error(`❌ Error creating table:`, error.message);
        throw error;
    }
}

// Main scraping function with Supabase support
async function scrapeAnalytics(startDate, endDate, channelId, options = {}) {
    const {
        saveToFile = false,
        saveToSupabase: shouldSaveToSupabase = true,
        supabaseTable = 'analytics_data',
        filename = null,
        verbose = true
    } = options;

    try {
        if (verbose) {
            console.log(`🔍 Scraping analytics for channel: ${channelId}`);
            console.log(`📅 Date range: ${startDate} to ${endDate}`);
            console.log(`🔧 Options:`, JSON.stringify(options, null, 2));
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format. Use YYYY-MM-DD');
        }
        
        if (start > end) {
            throw new Error('Start date must be before or equal to end date');
        }

        // Build API URL
        const apiUrl = `${API_BASE_URL}/api/analytics/range`;
        const params = {
            start_date: formatDate(start),
            end_date: formatDate(end),
            channel: channelId
        };

        if (verbose) {
            console.log(`🌐 Calling API: ${apiUrl}`);
            console.log(`📋 Parameters:`, params);
        }

        // Make API request
        const response = await axios.get(apiUrl, { params });
        
        if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = response.data;
        
        if (!data.success) {
            throw new Error(`API request failed: ${data.error || 'Unknown error'}`);
        }

        if (verbose) {
            console.log(`✅ Data retrieved successfully`);
            console.log(`📊 Summary: ${data.summary.totalViews} views, $${data.summary.totalRevenue} revenue`);
        }

        // Save to Supabase if requested
        if (shouldSaveToSupabase) {
            try {
                console.log(`🔍 About to call ensureAnalyticsTable with table: ${supabaseTable}`);
                await ensureAnalyticsTable(supabaseTable, { verbose, createIfMissing: true });
                console.log(`🔍 About to call saveToSupabase function`);
                
                // Call the saveToSupabase function directly
                await saveToSupabase(data, channelId, startDate, endDate, { 
                    tableName: supabaseTable,
                    verbose 
                });
            } catch (supabaseError) {
                console.error(`⚠️  Supabase save failed, continuing with file save...`);
                console.error(`   Error: ${supabaseError.message}`);
                // Fall back to file save
                options.saveToFile = true;
            }
        }

        // Save to file if requested
        if (options.saveToFile) {
            const outputPath = await saveToJson(data, channelId, startDate, endDate, filename);
            if (verbose) {
                console.log(`💾 Data saved to file: ${outputPath}`);
            }
        }

        return data;

    } catch (error) {
        console.error(`❌ Error scraping analytics for ${channelId}:`, error.message);
        throw error;
    }
}

// Function to save data to JSON file (fallback)
async function saveToJson(data, channelId, startDate, endDate, customFilename = null) {
    // Create output directory if it doesn't exist
    try {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
    } catch (error) {
        // Directory already exists
    }

    // Generate filename
    const filename = customFilename || 
        `analytics_${channelId}_${startDate}_${endDate}_${Date.now()}.json`;
    
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Prepare data for saving
    const saveData = {
        metadata: {
            scrapedAt: new Date().toISOString(),
            channelId: channelId,
            startDate: startDate,
            endDate: endDate,
            apiEndpoint: `${API_BASE_URL}/api/analytics/range`
        },
        data: data
    };

    // Save to file
    await fs.writeFile(filepath, JSON.stringify(saveData, null, 2));
    
    return filepath;
}

// Function to scrape multiple channels with Supabase
async function scrapeMultipleChannels(channels, startDate, endDate, options = {}) {
    const {
        delayBetweenRequests = RATE_LIMIT_DELAY,
        saveToFile = false,
        saveToSupabase = true,
        supabaseTable = 'analytics_data',
        verbose = true
    } = options;

    const results = [];
    const errors = [];

    if (verbose) {
        console.log(`🚀 Starting batch scrape for ${channels.length} channels`);
        console.log(`📅 Date range: ${startDate} to ${endDate}`);
        console.log(`⏱️  Delay between requests: ${delayBetweenRequests}ms`);
        console.log(`🗄️  Saving to Supabase: ${saveToSupabase ? 'Yes' : 'No'}`);
        console.log(`💾 Saving to files: ${saveToFile ? 'Yes' : 'No'}`);
    }

    for (let i = 0; i < channels.length; i++) {
        const channelId = channels[i];
        
        try {
            if (verbose) {
                console.log(`\n[${i + 1}/${channels.length}] Processing channel: ${channelId}`);
            }

            const result = await scrapeAnalytics(startDate, endDate, channelId, {
                saveToFile: options.saveToFile,
                saveToSupabase: options.saveToSupabase,
                supabaseTable: options.supabaseTable,
                verbose: false
            });

            results.push({
                channelId,
                success: true,
                data: result
            });

            if (verbose) {
                console.log(`✅ Success: ${result.summary.totalViews} views`);
            }

        } catch (error) {
            errors.push({
                channelId,
                success: false,
                error: error.message
            });

            if (verbose) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        // Add delay between requests (except for the last one)
        if (i < channels.length - 1 && delayBetweenRequests > 0) {
            if (verbose) {
                console.log(`⏳ Waiting ${delayBetweenRequests}ms before next request...`);
            }
            await delay(delayBetweenRequests);
        }
    }

    // Save batch results summary to Supabase if requested
    if (options.saveToSupabase) {
        try {
            const batchSummary = {
                channel_id: 'BATCH_SUMMARY',
                start_date: startDate,
                end_date: endDate,
                scraped_at: new Date().toISOString(),
                total_views: results.reduce((sum, r) => sum + (r.data?.summary?.totalViews || 0), 0),
                total_premium_views: results.reduce((sum, r) => sum + (r.data?.summary?.totalPremiumViews || 0), 0),
                total_revenue: results.reduce((sum, r) => sum + (r.data?.summary?.totalRevenue || 0), 0),
                data_points: results.length,
                success_rate: Math.round(((results.length - errors.length) / results.length) * 100),
                daily_data: [],
                raw_data: {
                    totalChannels: channels.length,
                    successful: results.length,
                    failed: errors.length,
                    results: results,
                    errors: errors
                },
                status: 'batch_completed',
                notice: `Batch scrape completed for ${channels.length} channels`,
                implementation: 'Batch scraping with Supabase storage'
            };

            await supabase
                .from(options.supabaseTable)
                .upsert(batchSummary, {
                    onConflict: 'channel_id,start_date,end_date',
                    ignoreDuplicates: false
                });

            if (verbose) {
                console.log(`📊 Batch summary saved to Supabase`);
            }
        } catch (error) {
            console.error(`⚠️  Failed to save batch summary to Supabase:`, error.message);
        }
    }

    // Save batch results summary to file if requested
    if (options.saveToFile) {
        const summary = {
            metadata: {
                scrapedAt: new Date().toISOString(),
                startDate: startDate,
                endDate: endDate,
                totalChannels: channels.length,
                successful: results.length,
                failed: errors.length
            },
            results: results,
            errors: errors
        };

        const summaryFilename = `batch_summary_${startDate}_${endDate}_${Date.now()}.json`;
        const summaryPath = path.join(OUTPUT_DIR, summaryFilename);
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

        if (verbose) {
            console.log(`\n📊 Batch summary saved to file: ${summaryPath}`);
        }
    }

    return { results, errors };
}

// Function to scrape date ranges with automatic chunking and Supabase
async function scrapeDateRange(channelId, startDate, endDate, options = {}) {
    const {
        maxDaysPerRequest = 30,
        delayBetweenRequests = RATE_LIMIT_DELAY,
        saveToFile = false,
        saveToSupabase = true,
        supabaseTable = 'analytics_data',
        verbose = true
    } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (verbose) {
        console.log(`📅 Scraping ${totalDays} days for channel: ${channelId}`);
        console.log(`🔧 Max days per request: ${maxDaysPerRequest}`);
        console.log(`🗄️  Saving to Supabase: ${saveToSupabase ? 'Yes' : 'No'}`);
    }

    if (totalDays <= maxDaysPerRequest) {
        // Single request
        return await scrapeAnalytics(startDate, endDate, channelId, { 
            saveToFile: options.saveToFile, 
            saveToSupabase: options.saveToSupabase,
            supabaseTable: options.supabaseTable,
            verbose 
        });
    }

    // Multiple requests with chunking
    const chunks = [];
    let current = new Date(start);
    
    while (current <= end) {
        const chunkEnd = new Date(current);
        chunkEnd.setDate(chunkEnd.getDate() + maxDaysPerRequest - 1);
        
        if (chunkEnd > end) {
            chunkEnd.setTime(end.getTime());
        }
        
        chunks.push({
            start: formatDate(current),
            end: formatDate(chunkEnd)
        });
        
        current.setDate(current.getDate() + maxDaysPerRequest);
    }

    if (verbose) {
        console.log(`📦 Split into ${chunks.length} chunks`);
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
            if (verbose) {
                console.log(`\n[${i + 1}/${chunks.length}] Processing chunk: ${chunk.start} to ${chunk.end}`);
            }

            const result = await scrapeAnalytics(chunk.start, chunk.end, channelId, {
                saveToFile: false,
                saveToSupabase: true,
                supabaseTable: options.supabaseTable,
                verbose: false
            });

            results.push({
                chunk: chunk,
                data: result
            });

            if (verbose) {
                console.log(`✅ Chunk completed: ${result.summary.totalViews} views`);
            }

        } catch (error) {
            errors.push({
                chunk: chunk,
                error: error.message
            });

            if (verbose) {
                console.log(`❌ Chunk failed: ${error.message}`);
            }
        }

        // Add delay between requests (except for the last one)
        if (i < chunks.length - 1 && delayBetweenRequests > 0) {
            if (verbose) {
                console.log(`⏳ Waiting ${delayBetweenRequests}ms before next chunk...`);
            }
            await delay(delayBetweenRequests);
        }
    }

    // Combine results
    const combinedData = combineChunkResults(results, startDate, endDate);
    
    // Save combined result to Supabase
    if (options.saveToSupabase) {
        try {
            await saveToSupabase(combinedData, channelId, startDate, endDate, { verbose });
        } catch (error) {
            console.error(`⚠️  Failed to save combined data to Supabase:`, error.message);
        }
    }

    // Save combined result to file if requested
    if (options.saveToFile) {
        const outputPath = await saveToJson(combinedData, channelId, startDate, endDate);
        if (verbose) {
            console.log(`💾 Combined data saved to file: ${outputPath}`);
        }
    }

    return {
        success: true,
        combinedData: combinedData,
        chunks: results,
        errors: errors
    };
}

// Helper function to combine chunk results
function combineChunkResults(chunkResults, startDate, endDate) {
    const combined = {
        success: true,
        dateRange: {
            start: startDate,
            end: endDate,
            days: 0
        },
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
        status: 'completed',
        progress: 100,
        notice: 'Combined from multiple API requests',
        implementation: 'Chunked scraping with automatic date range splitting'
    };

    let totalViews = 0;
    let totalPremiumViews = 0;
    let totalRevenue = 0;
    let dataPoints = 0;
    let errors = 0;

    // Combine daily data from all chunks
    chunkResults.forEach(chunk => {
        if (chunk.data && chunk.data.dailyData) {
            combined.dailyData.push(...chunk.data.dailyData);
            
            // Update totals
            if (chunk.data.summary) {
                totalViews += chunk.data.summary.totalViews || 0;
                totalPremiumViews += chunk.data.summary.totalPremiumViews || 0;
                totalRevenue += chunk.data.summary.totalRevenue || 0;
                dataPoints += chunk.data.summary.dataPoints || 0;
            }
        }
    });

    // Calculate combined summary
    combined.dateRange.days = combined.dailyData.length;
    combined.summary.totalViews = totalViews;
    combined.summary.totalPremiumViews = totalPremiumViews;
    combined.summary.totalRevenue = Math.round(totalRevenue * 100) / 100;
    combined.summary.averageRPM = totalViews > 0 ? Math.round((totalRevenue * 1000 / totalViews) * 100) / 100 : 0;
    combined.summary.dataPoints = dataPoints;
    combined.summary.dataAvailability = combined.dateRange.days > 0 ? Math.round((dataPoints / combined.dateRange.days) * 100) : 0;
    combined.summary.errors = errors;
    combined.summary.successRate = combined.dateRange.days > 0 ? Math.round(((combined.dateRange.days - errors) / combined.dateRange.days) * 100) : 0;

    return combined;
}

// Function to query data from Supabase
async function queryAnalyticsData(options = {}) {
    const {
        channelId = null,
        startDate = null,
        endDate = null,
        limit = 100,
        tableName = 'analytics_data',
        verbose = true
    } = options;

    try {
        if (verbose) {
            console.log(`🔍 Querying analytics data from Supabase`);
        }

        let query = supabase
            .from(tableName)
            .select('*')
            .order('scraped_at', { ascending: false })
            .limit(limit);

        if (channelId) {
            query = query.eq('channel_id', channelId);
        }

        if (startDate) {
            query = query.gte('start_date', startDate);
        }

        if (endDate) {
            query = query.lte('end_date', endDate);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Supabase query error: ${error.message}`);
        }

        if (verbose) {
            console.log(`✅ Retrieved ${data.length} records from Supabase`);
        }

        return data;

    } catch (error) {
        console.error(`❌ Error querying Supabase:`, error.message);
        throw error;
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
📊 Supabase Analytics Scraper

Usage:
  node supabase-scraper.js <command> [options]

Commands:
  single <channelId> <startDate> <endDate>     Scrape single channel for date range
  batch <startDate> <endDate> <channel1>...   Scrape multiple channels
  range <channelId> <startDate> <endDate>     Scrape with automatic date chunking
  query [options]                              Query existing data from Supabase

Examples:
  node supabase-scraper.js single UCmSy2p4qeO3cr_BPCF4oSeQ 2025-05-01 2025-05-05
  node supabase-scraper.js batch 2025-05-01 2025-05-05 UCmSy2p4qeO3cr_BPCF4oSeQ UC123456789
  node supabase-scraper.js range UCmSy2p4qeO3cr_BPCF4oSeQ 2025-04-01 2025-05-05
  node supabase-scraper.js query --channel UCmSy2p4qeO3cr_BPCF4oSeQ --limit 10

Options:
  --no-supabase     Don't save results to Supabase
  --save-files      Also save results to JSON files
  --table <name>    Supabase table name (default: analytics_data)
  --delay <ms>      Delay between requests (default: 1000ms)
  --verbose         Enable verbose logging
  --max-days <n>    Max days per request for range scraping (default: 30)
  --limit <n>       Limit query results (default: 100)
        `);
        return;
    }

    const command = args[0];
    const options = {
        saveToFile: args.includes('--save-files'),
        saveToSupabase: !args.includes('--no-supabase'),
        supabaseTable: 'analytics_data', // Default table name
        verbose: args.includes('--verbose'),
        delayBetweenRequests: parseInt(args[args.indexOf('--delay') + 1]) || RATE_LIMIT_DELAY,
        maxDaysPerRequest: parseInt(args[args.indexOf('--max-days') + 1]) || 30,
        limit: parseInt(args[args.indexOf('--limit') + 1]) || 100
    };

    // Check if custom table name is provided
    const tableIndex = args.indexOf('--table');
    if (tableIndex !== -1 && args[tableIndex + 1]) {
        options.supabaseTable = args[tableIndex + 1];
    }

    try {
        switch (command) {
            case 'single':
                if (args.length < 4) {
                    throw new Error('Single command requires: <channelId> <startDate> <endDate>');
                }
                const [_, channelId, startDate, endDate] = args;
                await scrapeAnalytics(startDate, endDate, channelId, options);
                break;

            case 'batch':
                if (args.length < 4) {
                    throw new Error('Batch command requires: <startDate> <endDate> <channel1>...');
                }
                const [__, startDate2, endDate2, ...channels] = args;
                await scrapeMultipleChannels(channels, startDate2, endDate2, options);
                break;

            case 'range':
                if (args.length < 4) {
                    throw new Error('Range command requires: <channelId> <startDate> <endDate>');
                }
                const [___, channelId2, startDate3, endDate3] = args;
                await scrapeDateRange(channelId2, startDate3, endDate3, options);
                break;

            case 'query':
                const queryOptions = {
                    channelId: args[args.indexOf('--channel') + 1] || null,
                    startDate: args[args.indexOf('--start-date') + 1] || null,
                    endDate: args[args.indexOf('--end-date') + 1] || null,
                    limit: options.limit,
                    tableName: options.supabaseTable,
                    verbose: options.verbose
                };
                const data = await queryAnalyticsData(queryOptions);
                console.log('\n📊 Query Results:');
                console.log(JSON.stringify(data, null, 2));
                break;

            default:
                throw new Error(`Unknown command: ${command}`);
        }

        console.log('\n🎉 Operation completed successfully!');
        
    } catch (error) {
        console.error('\n💥 Operation failed:', error.message);
        process.exit(1);
    }
}

// Export functions for use as a module
module.exports = {
    scrapeAnalytics,
    scrapeMultipleChannels,
    scrapeDateRange,
    saveToSupabase,
    queryAnalyticsData,
    ensureAnalyticsTable,
    createAnalyticsTable,
    generateDateRange,
    formatDate
};

// Run CLI if this file is executed directly
if (require.main === module) {
    main();
}
