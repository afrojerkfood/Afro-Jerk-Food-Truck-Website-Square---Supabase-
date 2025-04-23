/*
  # Fix Database Schema

  1. Changes
    - Drop and recreate menu_items table with proper structure
    - Drop and recreate schedules and locations tables with proper relationships
    - Add required indexes and foreign key constraints
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for public and authenticated access
*/

-- First, drop existing tables if they exist
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Create locations table
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  category text NOT NULL,
  is_vegetarian boolean DEFAULT false,
  is_spicy boolean DEFAULT false,
  is_gluten_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create schedules table with proper foreign key relationship
CREATE TABLE schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX schedules_location_id_idx ON schedules(location_id);
CREATE INDEX schedules_date_idx ON schedules(date);
CREATE INDEX menu_items_category_idx ON menu_items(category);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to locations"
  ON locations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to menu_items"
  ON menu_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to schedules"
  ON schedules FOR SELECT
  TO public
  USING (true);

-- Insert sample data for testing
INSERT INTO locations (name, address, lat, lng, image_url)
VALUES 
  ('Charlotte Uptown', '101 N Tryon St, Charlotte, NC', 35.2271, -80.8431, 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80'),
  ('Rock Hill', '122 Main St, Rock Hill, SC', 34.9249, -81.0251, 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80');

INSERT INTO menu_items (name, description, price, category, is_vegetarian, is_spicy, image_url)
VALUES 
  ('Jerk Chicken', 'Spicy grilled chicken with our signature jerk seasoning', 15.99, 'signatures', false, true, 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80'),
  ('Plantain Bowl', 'Sweet fried plantains with vegetables', 12.99, 'vegetarian', true, false, 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&q=80');

INSERT INTO schedules (location_id, date, start_time, end_time)
SELECT 
  id as location_id,
  CURRENT_DATE as date,
  '11:00' as start_time,
  '20:00' as end_time
FROM locations
WHERE name = 'Charlotte Uptown';