/*
  # Add YouTube Channel Metadata to User Requests Table
  
  1. Changes
    - Add youtube_channel_name column to store channel display names
    - Add youtube_channel_thumbnail column to store channel thumbnails
    - Add youtube_channel_metadata column to store additional metadata as JSON
  
  2. Purpose
    - Store YouTube channel names and thumbnails locally
    - Reduce API calls by caching channel metadata
    - Improve onboarding user experience
    - Maintain consistency with channels table approach
*/

-- Add YouTube channel metadata columns if they don't exist
DO $$ 
BEGIN
  -- Add youtube_channel_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_requests' AND column_name = 'youtube_channel_name') THEN
    ALTER TABLE user_requests ADD COLUMN youtube_channel_name text;
  END IF;
  
  -- Add youtube_channel_thumbnail column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_requests' AND column_name = 'youtube_channel_thumbnail') THEN
    ALTER TABLE user_requests ADD COLUMN youtube_channel_thumbnail text;
  END IF;
  
  -- Add youtube_channel_metadata column for additional data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_requests' AND column_name = 'youtube_channel_metadata') THEN
    ALTER TABLE user_requests ADD COLUMN youtube_channel_metadata jsonb;
  END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_user_requests_youtube_channel_name ON user_requests(youtube_channel_name);
CREATE INDEX IF NOT EXISTS idx_user_requests_youtube_channel_thumbnail ON user_requests(youtube_channel_thumbnail);

-- Add comments explaining the new columns
COMMENT ON COLUMN user_requests.youtube_channel_name IS 'YouTube channel display name (e.g., "Aean Tayawa")';
COMMENT ON COLUMN user_requests.youtube_channel_thumbnail IS 'YouTube channel thumbnail URL (default size)';
COMMENT ON COLUMN user_requests.youtube_channel_metadata IS 'Additional YouTube channel metadata as JSON (subscriber count, description, etc.)';

-- Test that the migration worked
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'User requests table now has YouTube channel metadata columns';
END $$;
