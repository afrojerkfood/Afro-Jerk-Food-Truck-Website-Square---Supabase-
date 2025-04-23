/*
  # Update Reviews Table RLS Policies

  1. Changes
    - Add storage policy for media bucket
    - Update reviews table policies to be more secure
    - Add policy for authenticated users

  2. Security
    - Enable RLS on storage.objects
    - Add policies for public read access to media bucket
    - Add policies for public write access to media bucket
    - Update reviews table policies
*/

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Add storage policies
CREATE POLICY "Give public users access to media bucket" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

CREATE POLICY "Allow public users to upload to media bucket" ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'media');

-- Drop existing reviews policies
DROP POLICY IF EXISTS "Allow public to read reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public to create reviews" ON reviews;

-- Add updated reviews policies
CREATE POLICY "Enable read access for all users"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (
    customer_name IS NOT NULL AND
    rating >= 1 AND
    rating <= 5 AND
    comment IS NOT NULL
  );