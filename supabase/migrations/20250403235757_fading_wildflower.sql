/*
  # Insert Sample Orders Data

  1. New Data
    - Insert sample locations
    - Insert sample orders with proper enum casting
    - Insert sample order items
    
  2. Data Structure
    - Locations with addresses and coordinates
    - Orders with customer details and status (using proper enum casting)
    - Order items linking to menu items
*/

-- Insert sample locations
INSERT INTO locations (name, address, lat, lng)
VALUES
  ('Charlotte Uptown', '101 N Tryon St, Charlotte, NC', 35.2271, -80.8431),
  ('Rock Hill', '122 Main St, Rock Hill, SC', 34.9249, -81.0251);

-- Insert sample orders
INSERT INTO orders (
  customer_name,
  customer_email,
  customer_phone,
  location_id,
  status,
  total_amount,
  pickup_time
)
SELECT
  'John Doe',
  'john@example.com',
  '+1 (704) 555-0123',
  locations.id,
  'completed'::order_status,
  39.96,
  NOW() - INTERVAL '2 hours'
FROM locations
WHERE name = 'Charlotte Uptown'
UNION ALL
SELECT
  'Sarah Smith',
  'sarah@example.com',
  '+1 (704) 555-0124',
  locations.id,
  'preparing'::order_status,
  18.98,
  NOW() - INTERVAL '1 hour'
FROM locations
WHERE name = 'Rock Hill'
UNION ALL
SELECT
  'Mike Johnson',
  'mike@example.com',
  '+1 (704) 555-0125',
  locations.id,
  'pending'::order_status,
  41.96,
  NOW() + INTERVAL '30 minutes'
FROM locations
WHERE name = 'Charlotte Uptown';

-- Insert order items
WITH order_data AS (
  SELECT 
    o.id as order_id,
    mi.id as menu_item_id,
    mi.price,
    CASE 
      WHEN o.customer_name = 'John Doe' THEN 
        CASE mi.name
          WHEN 'Jerk Chicken Platter' THEN 2
          WHEN 'Hibiscus Punch' THEN 2
        END
      WHEN o.customer_name = 'Sarah Smith' THEN
        CASE mi.name
          WHEN 'West African Peanut Stew' THEN 1
          WHEN 'Ginger Beer' THEN 1
        END
      WHEN o.customer_name = 'Mike Johnson' THEN
        CASE mi.name
          WHEN 'Suya Beef Skewers' THEN 2
          WHEN 'Jollof Rice & Fried Chicken' THEN 2
        END
    END as quantity
  FROM orders o
  CROSS JOIN menu_items mi
  WHERE mi.name IN (
    'Jerk Chicken Platter',
    'Ginger Beer',
    'West African Peanut Stew',
    'Suya Beef Skewers',
    'Jollof Rice & Fried Chicken'
  )
)
INSERT INTO order_items (order_id, menu_item_id, quantity, price)
SELECT 
  order_id,
  menu_item_id,
  quantity,
  price
FROM order_data
WHERE quantity IS NOT NULL;