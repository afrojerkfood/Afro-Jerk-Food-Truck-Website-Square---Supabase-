/*
  # Add Square webhook verification

  1. Changes
    - Add webhook signature verification table
    - Add webhook verification policy
    - Add webhook signature key column
    
  2. Security
    - Enable RLS on webhook verification
    - Add policies for authenticated access
*/

-- Create webhook verification table
CREATE TABLE IF NOT EXISTS square_webhook_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE square_webhook_verification ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for authenticated users" ON square_webhook_verification
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON square_webhook_verification
  FOR INSERT TO authenticated WITH CHECK (true);

-- Add initial signature key
INSERT INTO square_webhook_verification (signature_key)
VALUES (current_setting('square.webhook_signature_key'));