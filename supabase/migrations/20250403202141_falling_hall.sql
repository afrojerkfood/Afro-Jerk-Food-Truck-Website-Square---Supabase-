/*
  # Initial Schema Setup

  1. New Tables
    - `users`: Store user information
    - `blog_posts`: Store blog posts
    - `menu_items`: Store menu items
    - `orders`: Store customer orders
    - `order_items`: Store items within orders
    - `schedules`: Store food truck schedules
    - `locations`: Store location information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum types
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'completed', 'cancelled');
CREATE TYPE menu_category AS ENUM ('signatures', 'vegetarian', 'sides', 'drinks', 'combos', 'extras');
CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  category menu_category NOT NULL,
  is_vegetarian boolean DEFAULT false,
  is_spicy boolean DEFAULT false,
  is_gluten_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  content text,
  image_url text,
  category text NOT NULL,
  author text NOT NULL,
  status blog_status DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  location_id uuid REFERENCES locations(id),
  status order_status DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  pickup_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON locations FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON menu_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON blog_posts FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON orders FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON order_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON schedules FOR ALL TO authenticated USING (true);

-- Create indexes
CREATE INDEX menu_items_category_idx ON menu_items(category);
CREATE INDEX blog_posts_status_idx ON blog_posts(status);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX schedules_date_idx ON schedules(date);