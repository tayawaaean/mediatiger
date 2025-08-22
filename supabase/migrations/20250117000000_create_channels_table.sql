/*
  # Update Channels Table with YouTube Metadata
  
  1. Changes
    - Add thumbnail column to existing channels table
    - Add updated_at column if it doesn't exist
    - Ensure channel_name column exists
    - Add indexes for better performance
  
  2. Purpose
    - Store YouTube channel thumbnails locally
    - Reduce API calls by caching channel metadata
    - Improve performance and user experience
*/

-- Add thumbnail column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'channels' AND column_name = 'thumbnail') THEN
    ALTER TABLE channels ADD COLUMN thumbnail text;
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'channels' AND column_name = 'updated_at') THEN
    ALTER TABLE channels ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_status ON channels(status);
CREATE INDEX IF NOT EXISTS idx_channels_link ON channels(link);
CREATE INDEX IF NOT EXISTS idx_channels_user_status ON channels(user_id, status);

-- Function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_channel_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at (only if updated_at column exists)
DO $$
BEGIN
  -- Check if updated_at column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'channels' AND column_name = 'updated_at') THEN
    -- Check if trigger doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_channel_timestamp') THEN
      CREATE TRIGGER update_channel_timestamp
        BEFORE UPDATE ON channels
        FOR EACH ROW
        EXECUTE FUNCTION update_channel_updated_at();
    END IF;
  END IF;
END $$;

-- Add comments explaining the columns
COMMENT ON COLUMN channels.channel_name IS 'YouTube channel display name';
COMMENT ON COLUMN channels.thumbnail IS 'YouTube channel thumbnail URL';
COMMENT ON COLUMN channels.status IS 'Channel approval status: pending, approved, or rejected';

-- Test that the migration worked
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Channels table now has thumbnail and updated_at columns (if they were missing)';
END $$;
