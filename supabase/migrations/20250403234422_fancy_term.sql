/*
  # Fix menu items RLS policies

  1. Changes
    - Drop existing RLS policies for menu_items table
    - Create new policies that properly handle all operations (SELECT, INSERT, UPDATE, DELETE)
    
  2. Security
    - Public users can only read menu items
    - Authenticated users can perform all operations
    - Maintains existing RLS enabled status
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON menu_items;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON menu_items;

-- Create new policies with proper permissions
CREATE POLICY "Allow public read access"
  ON menu_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users full access"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);