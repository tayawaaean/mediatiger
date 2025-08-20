const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const API_BASE_URL = 'http://18.142.174.87:3001';
const OUTPUT_DIR = './scraped-data';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

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

// Main scraping function
async function scrapeAnalytics(startDate, endDate, channelId, options = {}) {
    const {
        saveToFile = true,
        filename = null,
        verbose = true
    } = options;

    try {
        if (verbose) {
            console.log(`🔍 Scraping analytics for channel: ${channelId}`);
            console.log(`📅 Date range: ${startDate} to ${endDate}`);
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

        // Save to file if requested
        if (saveToFile) {
            const outputPath = await saveToJson(data, channelId, startDate, endDate, filename);
            if (verbose) {
                console.log(`💾 Data saved to: ${outputPath}`);
            }
        }

        return data;

    } catch (error) {
        console.error(`❌ Error scraping analytics for ${channelId}:`, error.message);
        throw error;
    }
}

// Function to save data to JSON file
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

// Function to scrape multiple channels
async function scrapeMultipleChannels(channels, startDate, endDate, options = {}) {
    const {
        delayBetweenRequests = RATE_LIMIT_DELAY,
        saveToFile = true,
        verbose = true
    } = options;

    const results = [];
    const errors = [];

    if (verbose) {
        console.log(`🚀 Starting batch scrape for ${channels.length} channels`);
        console.log(`📅 Date range: ${startDate} to ${endDate}`);
        console.log(`⏱️  Delay between requests: ${delayBetweenRequests}ms`);
    }

    for (let i = 0; i < channels.length; i++) {
        const channelId = channels[i];
        
        try {
            if (verbose) {
                console.log(`\n[${i + 1}/${channels.length}] Processing channel: ${channelId}`);
            }

            const result = await scrapeAnalytics(startDate, endDate, channelId, {
                saveToFile,
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

    // Save batch results summary
    if (saveToFile) {
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
            console.log(`\n📊 Batch summary saved to: ${summaryPath}`);
        }
    }

    return { results, errors };
}

// Function to scrape date ranges with automatic chunking
async function scrapeDateRange(channelId, startDate, endDate, options = {}) {
    const {
        maxDaysPerRequest = 30, // API limit mentioned in your server code
        delayBetweenRequests = RATE_LIMIT_DELAY,
        saveToFile = true,
        verbose = true
    } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (verbose) {
        console.log(`📅 Scraping ${totalDays} days for channel: ${channelId}`);
        console.log(`🔧 Max days per request: ${maxDaysPerRequest}`);
    }

    if (totalDays <= maxDaysPerRequest) {
        // Single request
        return await scrapeAnalytics(startDate, endDate, channelId, { saveToFile, verbose });
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
                saveToFile: false, // We'll save the combined result
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
    
    // Save combined result
    if (saveToFile) {
        const outputPath = await saveToJson(combinedData, channelId, startDate, endDate);
        if (verbose) {
            console.log(`💾 Combined data saved to: ${outputPath}`);
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

    let totalDays = 0;
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

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
📊 Analytics Scraper

Usage:
  node analytics-scraper.js <command> [options]

Commands:
  single <channelId> <startDate> <endDate>     Scrape single channel for date range
  batch <startDate> <endDate> <channel1>...   Scrape multiple channels
  range <channelId> <startDate> <endDate>     Scrape with automatic date chunking

Examples:
  node analytics-scraper.js single UCmSy2p4qeO3cr_BPCF4oSeQ 2025-05-01 2025-05-05
  node analytics-scraper.js batch 2025-05-01 2025-05-05 UCmSy2p4qeO3cr_BPCF4oSeQ UC123456789
  node analytics-scraper.js range UCmSy2p4qeO3cr_BPCF4oSeQ 2025-04-01 2025-05-05

Options:
  --no-save        Don't save results to files
  --delay <ms>     Delay between requests (default: 1000ms)
  --verbose        Enable verbose logging
  --max-days <n>   Max days per request for range scraping (default: 30)
        `);
        return;
    }

    const command = args[0];
    const options = {
        saveToFile: !args.includes('--no-save'),
        verbose: args.includes('--verbose'),
        delayBetweenRequests: parseInt(args[args.indexOf('--delay') + 1]) || RATE_LIMIT_DELAY,
        maxDaysPerRequest: parseInt(args[args.indexOf('--max-days') + 1]) || 30
    };

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

            default:
                throw new Error(`Unknown command: ${command}`);
        }

        console.log('\n🎉 Scraping completed successfully!');
        
    } catch (error) {
        console.error('\n💥 Scraping failed:', error.message);
        process.exit(1);
    }
}

// Export functions for use as a module
module.exports = {
    scrapeAnalytics,
    scrapeMultipleChannels,
    scrapeDateRange,
    saveToJson,
    generateDateRange,
    formatDate
};

// Run CLI if this file is executed directly
if (require.main === module) {
    main();
}
