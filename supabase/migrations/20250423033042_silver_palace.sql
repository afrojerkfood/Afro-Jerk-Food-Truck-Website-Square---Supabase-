/*
  # Add Square Integration Schema

  1. New Fields
    - Add Square-specific fields to menu_items table:
      - square_item_id (text): Square catalog item ID
      - square_variation_id (text): Square item variation ID
      - square_modifier_id (text): Square modifier ID
      - last_synced_at (timestamp): Last sync timestamp
      - square_price (decimal): Price from Square
      - square_stock (integer): Current inventory count
    
  2. New Tables
    - square_sync_logs: Track synchronization history
    - square_webhooks: Store webhook events
    
  3. Changes
    - Add inventory tracking to menu_items
    - Add Square order reference to orders table
    
  4. Indexes
    - Add indexes for efficient lookups
*/

-- Add Square fields to menu_items
ALTER TABLE menu_items
ADD COLUMN square_item_id text,
ADD COLUMN square_variation_id text,
ADD COLUMN square_modifier_id text,
ADD COLUMN last_synced_at timestamptz,
ADD COLUMN square_price decimal(10,2),
ADD COLUMN square_stock integer,
ADD COLUMN track_inventory boolean DEFAULT false,
ADD CONSTRAINT square_item_unique UNIQUE (square_item_id);

-- Create sync logs table
CREATE TABLE IF NOT EXISTS square_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL,
  status text NOT NULL,
  details jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS square_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Add Square order reference to orders
ALTER TABLE orders
ADD COLUMN square_order_id text,
ADD COLUMN square_payment_id text,
ADD CONSTRAINT square_order_unique UNIQUE (square_order_id);

-- Add indexes
CREATE INDEX menu_items_square_item_id_idx ON menu_items(square_item_id);
CREATE INDEX menu_items_last_synced_idx ON menu_items(last_synced_at);
CREATE INDEX square_webhooks_event_type_idx ON square_webhooks(event_type);
CREATE INDEX square_webhooks_processed_idx ON square_webhooks(processed);

-- Enable RLS
ALTER TABLE square_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE square_webhooks ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for authenticated users" ON square_sync_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON square_sync_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON square_webhooks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON square_webhooks
  FOR INSERT TO authenticated WITH CHECK (true);