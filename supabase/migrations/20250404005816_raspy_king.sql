/*
  # Add sample blog posts and update policies

  1. Data
    - Adds sample blog posts with different statuses
    - Includes various categories and authors
    
  2. Security
    - Updates blog_posts table policies to allow public access
    
  3. Changes
    - Inserts initial blog content
    - Modifies access policies
*/

-- First, ensure we have the correct policies by dropping existing ones
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON blog_posts;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON blog_posts;
    DROP POLICY IF EXISTS "Public access to blogs" ON blog_posts;
END $$;

-- Create new policy for public access
CREATE POLICY "Allow public blog access"
  ON blog_posts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert sample blog posts
INSERT INTO blog_posts (
  title,
  excerpt,
  content,
  image_url,
  category,
  author,
  status,
  published_at
)
VALUES
  (
    'New Location Opening in Rock Hill!',
    'We''re excited to announce our expansion to Rock Hill. Join us for our grand opening celebration with special offers and live music.',
    'We are thrilled to announce that Afro Jerk Food Truck is expanding to Rock Hill! After months of preparation and overwhelming support from our Charlotte community, we''re ready to bring our unique fusion of African and Caribbean flavors to Rock Hill.

Join us for our grand opening celebration on April 15th, where we''ll be offering:
- Special opening day discounts
- Live music from local artists
- Free samples of our signature dishes
- Exclusive merchandise giveaways

We can''t wait to become part of the Rock Hill community and share our passion for authentic African and Caribbean cuisine with you all.',
    'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80',
    'Announcements',
    'Team Afro Jerk',
    'published',
    NOW()
  ),
  (
    'Behind Our Signature Jerk Sauce',
    'Discover the story behind our famous jerk sauce, a perfect blend of African and Caribbean spices that makes our dishes unique.',
    'Our signature jerk sauce is more than just a condiment – it''s a story of cultural fusion and family tradition. Passed down through generations and perfected over time, our unique recipe combines traditional Jamaican jerk spices with West African peppers and herbs.

The key to our sauce''s distinctive flavor lies in:
- Authentic Scotch bonnet peppers
- Hand-picked African bird''s eye chilies
- Fresh thyme and scallions
- Our secret blend of African spices

Each batch is made fresh weekly, ensuring the perfect balance of heat and flavor in every dish.',
    'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80',
    'Food Stories',
    'Chef James',
    'published',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Community Event: Food Truck Festival',
    'Join us at the upcoming Charlotte Food Truck Festival where we''ll be serving our full menu plus special festival-exclusive items.',
    'We''re excited to participate in this year''s Charlotte Food Truck Festival! This two-day event brings together the best food trucks in the region, and we''re honored to be part of it.

For this special occasion, we''re introducing several festival-exclusive dishes that combine our signature flavors in new and exciting ways. Don''t miss our:
- Jerk Chicken Sliders
- African Spiced Sweet Potato Fries
- Fusion Tacos with Caribbean Slaw
- Special Festival-Only Drink Combinations

Mark your calendars for May 1st-2nd at the Charlotte Convention Center.',
    'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80',
    'Events',
    'Team Afro Jerk',
    'published',
    NOW() - INTERVAL '10 days'
  ),
  (
    'Introducing: West African Peanut Stew',
    'Meet our newest menu addition: A rich, creamy stew that brings authentic West African flavors to Charlotte.',
    'We''re proud to introduce our latest menu item: West African Peanut Stew. This hearty, nutritious dish represents the perfect fusion of traditional West African cuisine with modern culinary techniques.

Our version of this classic dish features:
- Locally sourced sweet potatoes
- Organic peanuts
- Fresh ginger and garlic
- A blend of traditional African spices
- Optional protein additions

Available starting next week, this stew is perfect for both vegetarians and meat-lovers alike.',
    'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80',
    'Menu Updates',
    'Chef James',
    'published',
    NOW() - INTERVAL '15 days'
  ),
  (
    'Upcoming Special: Jollof Rice Festival',
    'Get ready for a week-long celebration of the iconic West African dish.',
    'Draft content for upcoming Jollof Rice Festival announcement.',
    'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80',
    'Events',
    'Team Afro Jerk',
    'draft',
    NULL
  );