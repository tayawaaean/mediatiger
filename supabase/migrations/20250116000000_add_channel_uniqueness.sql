/*
  # Add Channel Uniqueness Constraints
  
  1. Changes
    - Add unique constraint on channels.link to prevent duplicate URLs
    - Add unique constraint on channels(user_id, link) to allow same URL for different users
    - Add indexes for better performance on channel lookups
  
  2. Purpose
    - Prevent duplicate channel submissions
    - Improve query performance for channel validation
    - Ensure data integrity
*/

-- Add unique constraint on link column (global uniqueness)
ALTER TABLE channels 
ADD CONSTRAINT channels_link_unique UNIQUE (link);

-- Add unique constraint on user_id + link combination
-- This allows the same user to have multiple channels but prevents duplicates
ALTER TABLE channels 
ADD CONSTRAINT channels_user_link_unique UNIQUE (user_id, link);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_link ON channels(link);
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_status ON channels(status);
CREATE INDEX IF NOT EXISTS idx_channels_user_status ON channels(user_id, status);

-- Add comment explaining the constraints
COMMENT ON CONSTRAINT channels_link_unique ON channels IS 
  'Ensures no duplicate YouTube channel URLs across all users';

COMMENT ON CONSTRAINT channels_user_link_unique ON channels IS 
  'Ensures no duplicate YouTube channel URLs per user';

-- Function to check for duplicate channels before insertion
CREATE OR REPLACE FUNCTION check_channel_duplicates()
RETURNS trigger AS $$
DECLARE
  existing_channel RECORD;
BEGIN
  -- Check if channel already exists with any status
  SELECT id, user_id, status INTO existing_channel
  FROM channels
  WHERE link = NEW.link;
  
  IF FOUND THEN
    IF existing_channel.user_id = NEW.user_id THEN
      -- Same user, check status
      IF existing_channel.status = 'pending' THEN
        RAISE EXCEPTION 'Channel is already pending review for this user';
      ELSIF existing_channel.status = 'approved' THEN
        RAISE EXCEPTION 'Channel is already approved for this user';
      ELSIF existing_channel.status = 'rejected' THEN
        -- Allow resubmission of rejected channels
        RETURN NEW;
      END IF;
    ELSE
      -- Different user
      RAISE EXCEPTION 'Channel is already registered by another user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check duplicates before insertion
DROP TRIGGER IF EXISTS check_channel_duplicates_trigger ON channels;
CREATE TRIGGER check_channel_duplicates_trigger
  BEFORE INSERT ON channels
  FOR EACH ROW
  EXECUTE FUNCTION check_channel_duplicates();

-- Add comment explaining the trigger
COMMENT ON TRIGGER check_channel_duplicates_trigger ON channels IS 
  'Prevents duplicate channel submissions and provides clear error messages';
