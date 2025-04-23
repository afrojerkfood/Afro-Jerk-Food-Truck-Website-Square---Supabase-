/*
  # Add reviews functionality
  
  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `image_url` (text, nullable)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on reviews table
    - Add policy for public access to create and read reviews
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to create reviews"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);