# Analytics Services

This directory contains the analytics services for the MediaTiger application.

## Services

### 1. `analyticsService.ts` - Real Analytics API Service
- Connects to real analytics APIs
- Handles rate limiting and fallbacks
- Used in production

### 2. `dummyAnalyticsService.ts` - Dummy Analytics Service
- Generates realistic sample data for development and testing
- Implements the same interface as the real service
- Configurable through `src/config/analytics.ts`

## Configuration

To switch between dummy and real data, edit `src/config/analytics.ts`:

```typescript
export const ANALYTICS_CONFIG = {
  // Set to true to use dummy data, false to use real API
  USE_DUMMY_DATA: true,
  // ... other settings
};
```

## Usage

### In Components

```typescript
// Import the appropriate service based on configuration
import { shouldUseDummyData } from '../config/analytics';
import { analyticsService } from './analyticsService';
import { dummyAnalyticsService } from './dummyAnalyticsService';

// Use the appropriate service
const service = shouldUseDummyData() ? dummyAnalyticsService : analyticsService;

// Fetch data
const data = await service.fetchAnalyticsRange(startDate, endDate, channel);
```

### Dummy Data Features

The dummy service generates realistic data with:

- **Daily Variations**: ±15% random variation
- **Weekly Patterns**: 30% boost on weekends
- **Monthly Trends**: Gradual growth over month
- **Realistic RPM**: $0.10 base with ±10% variation
- **Premium Views**: 8-14% of total views
- **API Simulation**: Configurable delays (300-1000ms)

### Generated Data Types

- `fetchAnalyticsRange()` - Daily analytics for date range
- `fetchChannels()` - List of sample channels
- `generatePerformanceTrends()` - Performance data for charts
- `generateRealtimeData()` - Real-time performance metrics
- `generateRecentActivity()` - Recent activity feed
- `generateGoals()` - Progress tracking goals

## Switching to Real Data

1. Set `USE_DUMMY_DATA: false` in `src/config/analytics.ts`
2. Update the real API endpoint in `analyticsService.ts`
3. Ensure your API keys and credentials are configured
4. Test with real data

## Benefits of Dummy Data

- **Development**: Work on UI without waiting for API setup
- **Testing**: Consistent data for testing different scenarios
- **Demo**: Present realistic analytics to stakeholders
- **Offline**: Work without internet connection
- **Performance**: No API rate limits or delays during development
