const cron = require('node-cron');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const API_BASE_URL = 'http://18.142.174.87:3001';
const CRON_SCHEDULE = '0 2 * * *'; // Run at 2:00 AM every day

// Channels will be fetched dynamically from the API
let CHANNELS = [];

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables:');
    console.error('   SUPABASE_URL and SUPABASE_ANON_KEY are required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Cron job instance
let cronJob = null;
let isRunning = false;

// Function to fetch available channels from your API
async function fetchAvailableChannels() {
    try {
        console.log('🔍 Fetching available channels from API...');
        
        const response = await axios.get(`${API_BASE_URL}/api/analytics/channels/list`);
        
        if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
        }
        
        const data = response.data;
        
        if (!data.success) {
            throw new Error(`API request failed: ${data.error || 'Unknown error'}`);
        }
        
        // Extract channel IDs from the response
        const channels = data.channels || [];
        const channelIds = channels.map(channel => channel.id).filter(Boolean);
        
        console.log(`✅ Found ${channelIds.length} available channels:`);
        channels.forEach((channel, index) => {
            console.log(`   ${index + 1}. ${channel.name} (${channel.id}) - ${channel.status}`);
        });
        
        return channelIds;
        
    } catch (error) {
        console.error('❌ Error fetching channels:', error.message);
        
        // Fallback to default channels if API fails
        const fallbackChannels = [
            'UCmSy2p4qeO3cr_BPCF4oSeQ', // Offline Ace
            'UCsBjURrPoezykLs9EqgamOA', // Fireship
            'UCX6OQ3DkcsbYNE6H8uQQuVA'  // MrBeast
        ];
        
        console.log('⚠️  Using fallback channels due to API error');
        return fallbackChannels;
    }
}

// Utility function to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Function to get today's date (or yesterday if running early morning)
const getTargetDate = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // If running between 12 AM and 6 AM, fetch yesterday's data
    // This ensures we get complete data for the previous day
    if (hour < 6) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatDate(yesterday);
    }
    
    return formatDate(now);
};

// Function to fetch channel data from your API
async function fetchChannelData(channelId, date) {
    try {
        console.log(`🔍 Fetching data for channel ${channelId} on ${date}`);
        
        const apiUrl = `${API_BASE_URL}/api/analytics/range`;
        const params = {
            start_date: date,
            end_date: date,
            channel: channelId
        };
        
        const response = await axios.get(apiUrl, { params });
        
        if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
        }
        
        const data = response.data;
        
        if (!data.success) {
            throw new Error(`API request failed: ${data.error || 'Unknown error'}`);
        }
        
        console.log(`✅ Data retrieved for ${channelId}: ${data.summary?.totalViews || 0} views`);
        return data;
        
    } catch (error) {
        console.error(`❌ Error fetching data for ${channelId}:`, error.message);
        throw error;
    }
}

// Function to save data to Supabase
async function saveToSupabase(data, channelId, date) {
    try {
        console.log(`🗄️  Saving data to Supabase for ${channelId} on ${date}`);
        
        const supabaseData = {
            channel_id: channelId,
            start_date: date,
            end_date: date,
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
            implementation: 'Daily cron job scraper'
        };
        
        // Use upsert to avoid duplicates
        const result = await supabase
            .from('analytics_data')
            .upsert(supabaseData, {
                onConflict: 'channel_id,start_date,end_date',
                ignoreDuplicates: false
            });
        
        if (result.error) {
            throw new Error(`Supabase error: ${result.error.message}`);
        }
        
        console.log(`✅ Data saved to Supabase successfully for ${channelId}`);
        if (result.data) {
            console.log(`📊 Record ID: ${result.data[0]?.id || 'N/A'}`);
        }
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error saving to Supabase for ${channelId}:`, error.message);
        throw error;
    }
}

// Function to process all channels for a given date
async function processAllChannels(date) {
    const results = [];
    const errors = [];
    
    // Refresh channel list before processing
    console.log('🔄 Refreshing channel list...');
    CHANNELS = await fetchAvailableChannels();
    
    if (CHANNELS.length === 0) {
        throw new Error('No channels available for processing');
    }
    
    console.log(`🚀 Starting daily scrape for ${CHANNELS.length} channels on ${date}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    
    for (let i = 0; i < CHANNELS.length; i++) {
        const channelId = CHANNELS[i];
        
        try {
            console.log(`\n[${i + 1}/${CHANNELS.length}] Processing channel: ${channelId}`);
            
            // Fetch data from your API
            const data = await fetchChannelData(channelId, date);
            
            // Save to Supabase
            await saveToSupabase(data, channelId, date);
            
            results.push({
                channelId,
                success: true,
                views: data.summary?.totalViews || 0,
                revenue: data.summary?.totalRevenue || 0
            });
            
            // Add delay between requests to be respectful
            if (i < CHANNELS.length - 1) {
                console.log(`⏳ Waiting 2 seconds before next channel...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
        } catch (error) {
            errors.push({
                channelId,
                success: false,
                error: error.message
            });
            
            console.error(`❌ Failed to process ${channelId}: ${error.message}`);
        }
    }
    
    // Log summary
    console.log(`\n📊 Daily Scrape Summary for ${date}:`);
    console.log(`✅ Successful: ${results.length}/${CHANNELS.length}`);
    console.log(`❌ Failed: ${errors.length}/${CHANNELS.length}`);
    
    if (results.length > 0) {
        const totalViews = results.reduce((sum, r) => sum + (r.views || 0), 0);
        const totalRevenue = results.reduce((sum, r) => sum + (r.revenue || 0), 0);
        console.log(`📈 Total Views: ${totalViews.toLocaleString()}`);
        console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
    }
    
    if (errors.length > 0) {
        console.log(`\n❌ Errors encountered:`);
        errors.forEach(error => {
            console.log(`   - ${error.channelId}: ${error.error}`);
        });
    }
    
    console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
    
    return { results, errors };
}

// Function to start the cron job
async function startCronJob() {
    if (cronJob) {
        console.log('⚠️  Cron job is already running');
        return;
    }
    
    console.log('🚀 Starting daily cron job...');
    console.log(`📅 Schedule: ${CRON_SCHEDULE} (2:00 AM daily)`);
    
    // Initialize channels list
    try {
        CHANNELS = await fetchAvailableChannels();
        console.log(`📊 Channels: ${CHANNELS.length} channels configured`);
    } catch (error) {
        console.error('❌ Failed to initialize channels:', error.message);
        console.log('⚠️  Cron job will use fallback channels');
    }
    
    cronJob = cron.schedule(CRON_SCHEDULE, async () => {
        if (isRunning) {
            console.log('⚠️  Previous job still running, skipping this execution');
            return;
        }
        
        isRunning = true;
        const date = getTargetDate();
        
        try {
            console.log(`\n🕐 Cron job triggered at ${new Date().toISOString()}`);
            console.log(`📅 Processing date: ${date}`);
            
            await processAllChannels(date);
            
        } catch (error) {
            console.error('💥 Cron job failed:', error.message);
        } finally {
            isRunning = false;
        }
    }, {
        scheduled: true,
        timezone: "UTC"
    });
    
    console.log('✅ Cron job started successfully');
    console.log('💡 Use "npm run cron:status" to check status');
    console.log('💡 Use "npm run cron:run-now" to run immediately');
}

// Function to stop the cron job
function stopCronJob() {
    if (!cronJob) {
        console.log('⚠️  No cron job is running');
        return;
    }
    
    cronJob.stop();
    cronJob = null;
    isRunning = false;
    
    console.log('🛑 Cron job stopped');
}

// Function to run the job immediately
async function runJobNow() {
    if (isRunning) {
        console.log('⚠️  Job is already running');
        return;
    }
    
    console.log('▶️  Running job immediately...');
    
    // Refresh channels before running
    try {
        CHANNELS = await fetchAvailableChannels();
        console.log(`📊 Using ${CHANNELS.length} channels for immediate run`);
    } catch (error) {
        console.error('❌ Failed to refresh channels:', error.message);
        if (CHANNELS.length === 0) {
            console.log('⚠️  No channels available, aborting');
            return;
        }
    }
    
    const date = getTargetDate();
    
    try {
        isRunning = true;
        await processAllChannels(date);
    } catch (error) {
        console.error('💥 Immediate job failed:', error.message);
    } finally {
        isRunning = false;
    }
}

// Function to show status
async function showStatus() {
    console.log('📊 Cron Scraper Status:');
    console.log(`   Running: ${cronJob ? 'Yes' : 'No'}`);
    console.log(`   Currently Processing: ${isRunning ? 'Yes' : 'No'}`);
    console.log(`   Schedule: ${CRON_SCHEDULE}`);
    console.log(`   Next Run: ${cronJob ? '2:00 AM UTC tomorrow' : 'Not scheduled'}`);
    
    // Try to fetch current channels
    try {
        const currentChannels = await fetchAvailableChannels();
        console.log(`   Available Channels: ${currentChannels.length}`);
        
        if (currentChannels.length > 0) {
            console.log('\n📋 Available Channels:');
            currentChannels.forEach((channelId, index) => {
                console.log(`   ${index + 1}. ${channelId}`);
            });
        }
    } catch (error) {
        console.log(`   Available Channels: ${CHANNELS.length} (cached)`);
        if (CHANNELS.length > 0) {
            console.log('\n📋 Cached Channels:');
            CHANNELS.forEach((channelId, index) => {
                console.log(`   ${index + 1}. ${channelId}`);
            });
        }
    }
}

// CLI interface
async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            startCronJob();
            // Keep the process running
            process.on('SIGINT', () => {
                console.log('\n🛑 Received SIGINT, stopping cron job...');
                stopCronJob();
                process.exit(0);
            });
            break;
            
        case 'stop':
            stopCronJob();
            process.exit(0);
            break;
            
        case 'run-now':
            await runJobNow();
            process.exit(0);
            break;
            
        case 'status':
            await showStatus();
            process.exit(0);
            break;
            
        default:
            console.log(`
🚀 Daily Cron Scraper for Supabase

Usage:
  node cron-scraper.js <command>

Commands:
  start       Start the daily cron job (runs at 2:00 AM UTC)
  stop        Stop the cron job
  run-now     Run the job immediately
  status      Show current status

Examples:
  npm run cron:start      # Start the cron job
  npm run cron:stop       # Stop the cron job
  npm run cron:run-now    # Run immediately
  npm run cron:status     # Check status

Configuration:
  - Schedule: ${CRON_SCHEDULE} (2:00 AM UTC daily)
  - Channels: Dynamically loaded from ${API_BASE_URL}/api/analytics/channels/list
  - API: ${API_BASE_URL}
  - Table: analytics_data

💡 The cron job will automatically:
   1. Fetch the latest channel list from your API
   2. Process each available channel
   3. Insert one row per channel per day into your analytics_data table
   4. Handle new channels automatically when they're added to your system
            `);
            break;
    }
}

// Run CLI if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

// Export functions for use as a module
module.exports = {
    startCronJob,
    stopCronJob,
    runJobNow,
    showStatus,
    processAllChannels,
    CHANNELS,
    CRON_SCHEDULE
};
