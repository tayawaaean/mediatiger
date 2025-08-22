/*
  # Create Custom Track Requests Table

  1. New Tables
    - `custom_track_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `submitted_by` (text, not null)
      - `submitted_at` (timestamptz)
      - `status` (text, constrained)
      - `reference_tracks` (text[])
      - `description` (text)
      - `example_videos` (text[])
      - `priority` (text, constrained)
      - `estimated_completion` (timestamptz)
      - `completed_track` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Authenticated users to create and view own requests
      - Admins to view and update all requests

  3. Performance
    - Add index on user_id for faster user-specific queries

  4. Triggers
    - Update `updated_at` on row updates
*/

-- Create custom track requests table
CREATE TABLE IF NOT EXISTS custom_track_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  submitted_by text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text CHECK (status IN ('pending', 'in-progress', 'completed', 'rejected')) DEFAULT 'pending',
  reference_tracks text[] DEFAULT '{}',
  description text,
  example_videos text[] DEFAULT '{}',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  estimated_completion timestamptz,
  completed_track text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE custom_track_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_track_requests' 
    AND policyname = 'Users can create requests'
  ) THEN
    DROP POLICY "Users can create requests" ON custom_track_requests;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_track_requests' 
    AND policyname = 'Users can view own requests'
  ) THEN
    DROP POLICY "Users can view own requests" ON custom_track_requests;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_track_requests' 
    AND policyname = 'Admins can view all requests'
  ) THEN
    DROP POLICY "Admins can view all requests" ON custom_track_requests;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_track_requests' 
    AND policyname = 'Admins can update requests'
  ) THEN
    DROP POLICY "Admins can update requests" ON custom_track_requests;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Users can create requests"
  ON custom_track_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests"
  ON custom_track_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
  ON custom_track_requests
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'supabase_admin');

CREATE POLICY "Admins can update requests"
  ON custom_track_requests
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'supabase_admin');

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_id ON custom_track_requests(user_id);

-- Create function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_custom_track_requests_updated_at
  BEFORE UPDATE ON custom_track_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();