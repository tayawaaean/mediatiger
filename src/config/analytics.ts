// Analytics configuration
export const ANALYTICS_CONFIG = {
  // Set to true to use dummy data, false to use real API
  USE_DUMMY_DATA: true,
  
  // Dummy data settings
  DUMMY: {
    // Base daily values
    BASE_DAILY_VIEWS: 1500000, // 1.5M views per day
    BASE_DAILY_REVENUE: 150, // $150 per day
    BASE_RPM: 0.10, // $0.10 RPM
    
    // Variation ranges
    DAILY_VARIATION_RANGE: 0.15, // ±15% daily variation
    WEEKEND_BOOST: 1.3, // 30% boost on weekends
    MONTHLY_GROWTH: 0.4, // 40% growth over month
    
    // Premium views percentage
    PREMIUM_VIEWS_MIN: 0.08, // 8% minimum
    PREMIUM_VIEWS_MAX: 0.14, // 14% maximum
    
    // RPM variation
    RPM_VARIATION: 0.1, // ±10% RPM variation
    
    // API simulation delays
    MIN_DELAY: 300, // Minimum delay in ms
    MAX_DELAY: 1000, // Maximum delay in ms
  },
  
  // Real API settings
  REAL: {
    BASE_URL: 'https://your-api-domain.com',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  }
};

// Helper function to check if dummy data should be used
export const shouldUseDummyData = (): boolean => {
  // You can add environment-based logic here
  // e.g., return process.env.NODE_ENV === 'development' || ANALYTICS_CONFIG.USE_DUMMY_DATA;
  return ANALYTICS_CONFIG.USE_DUMMY_DATA;
};
