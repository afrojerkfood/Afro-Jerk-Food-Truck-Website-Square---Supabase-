/*
  # Update menu items RLS policy

  1. Changes
    - Allow public read access to menu_items table
    - Keep authenticated-only access for write operations

  2. Security
    - Enables anonymous users to view menu items
    - Maintains secure write access for authenticated users only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON menu_items;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON menu_items;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON menu_items
  FOR SELECT
  USING (true);

CREATE POLICY "Enable write access for authenticated users" ON menu_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);