/*
  # Add Analytics CID to Channels Table
  
  1. Changes
    - Add analytics_cid column to channels table
    - This column will store the analytics channel ID for data fetching
    - Add index for better performance on analytics lookups
  
  2. Purpose
    - Link channels to analytics data in daily_channel_analytics table
    - Enable proper revenue and views calculation
    - Fix the "column channels.analytics_cid does not exist" error
*/

-- Add analytics_cid column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'channels' AND column_name = 'analytics_cid') THEN
    ALTER TABLE channels ADD COLUMN analytics_cid text;
    RAISE NOTICE 'Added analytics_cid column to channels table';
  ELSE
    RAISE NOTICE 'analytics_cid column already exists in channels table';
  END IF;
END $$;

-- Create index for better performance on analytics_cid lookups
CREATE INDEX IF NOT EXISTS idx_channels_analytics_cid ON channels(analytics_cid);

-- Add comment explaining the column
COMMENT ON COLUMN channels.analytics_cid IS 'Analytics channel ID for linking to daily_channel_analytics table';

-- Test that the migration worked
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Channels table now has analytics_cid column for analytics data linking';
END $$;
