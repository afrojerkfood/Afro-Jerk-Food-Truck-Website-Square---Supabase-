/*
  # Populate menu items data

  1. Data Population
    - Adds all menu items from the current static data
    - Includes names, descriptions, prices, and dietary information
    - Preserves all categories and item relationships

  2. Categories covered:
    - Signature plates
    - Vegetarian dishes
    - Sides
    - Drinks
    - Combo meals
    - Extras
*/

-- Signatures
INSERT INTO menu_items (name, description, price, image_url, category, is_vegetarian, is_spicy, is_gluten_free)
VALUES
  ('Jollof Rice & Fried Chicken', 'Savory Liberian-style Jollof rice made with tomatoes, onions, and spices, paired with crispy fried chicken.', 18.00, 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80', 'signatures', false, true, false),
  ('Cassava Leaf', 'Rich, flavorful cassava leaf stew cooked in palm oil with chicken and smoke turkey, served over steamed rice.', 16.75, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80', 'signatures', false, false, false),
  ('Oxtail & Rice', 'Tender oxtail cooked in a delicious, savory broth with spices, served with rice and fried plantains.', 18.75, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80', 'signatures', false, false, false),
  ('Jerk Chicken & Rice', 'Grilled chicken marinated in a spicy jerk seasoning, served with seasoned rice and fried plantains.', 16.75, 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80', 'signatures', false, true, false),
  ('Curry Chicken & Rice', 'Tender chicken simmered in a flavorful curry sauce, served with white rice.', 16.75, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80', 'signatures', false, false, false),
  ('Okra Sauce & Rice', 'A hearty and flavorful okra stew, cooked with spices, tomatoes, and onions, served over rice.', 16.75, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80', 'signatures', false, false, false),
  ('Pepper Sauce with Fried Fish', 'Spicy Liberian-style pepper sauce served with crispy fried fish. FRIDAYS ONLY', 14.75, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80', 'signatures', false, true, false);

-- Vegetarian
INSERT INTO menu_items (name, description, price, image_url, category, is_vegetarian, is_spicy, is_gluten_free)
VALUES
  ('Potatoes Greens', 'Liberian-style flavored potatoes greens and spices, served with rice.', 15.75, 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhntkclOWi2LqRlG-3p5YUUauGc2lzrfDYkxrNpovw4cRai8ZZ3bRLWxsZfaOGtnBZs7uYC3JAbKNGTKYDwBdMEjBx935ysra5Vx_1CtKmoKN57fpNmlVERC71Ez69heaCS5NYqVyV8OY6B/s1600/liberiancollardgreens2.JPG', 'vegetarian', true, false, false),
  ('Collard Greens & Rice', 'Sautéed collard greens cooked in palm oil and spices, served with steamed rice.', 15.75, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80', 'vegetarian', true, false, false),
  ('Mixed Vegetables & Rice', 'A colorful mix of vegetables like carrots, peas, and corn, cooked in a savory sauce, served with rice.', 8.00, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80', 'vegetarian', true, false, false),
  ('Check Rice & Gravy', 'Liberian-style chalk rice (a softer, sticky rice) served with a savory, flavorful gravy.', 15.75, 'https://images.unsplash.com/photo-1575316571198-0cd2c8b7557f?auto=format&fit=crop&q=80', 'vegetarian', true, false, false);

-- Sides
INSERT INTO menu_items (name, description, price, image_url, category, is_vegetarian, is_spicy, is_gluten_free)
VALUES
  ('Fried Plantains', 'Sweet, crispy fried plantains.', 6.95, 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&q=80', 'sides', true, false, true),
  ('Kelewele (Spicy Fried Plantains)', 'Spicy fried plantains marinated in ginger, garlic, and pepper.', 8.75, 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&q=80', 'sides', true, true, true),
  ('Cassava Fries (yuca)', 'Fried balls made from cassava dough, a traditional Liberian snack.', 6.75, 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&q=80', 'sides', true, false, true);

-- Drinks
INSERT INTO menu_items (name, description, price, image_url, category, is_vegetarian, is_spicy, is_gluten_free)
VALUES
  ('Sodas', 'Traditional Coke/Pepsi, Sprite, Ginger Ale, Fanta and Tahitian Treat.', 2.50, 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&q=80', 'drinks', true, false, true),
  ('Ginger Beer', 'Spicy ginger beer.', 4.75, 'https://images.unsplash.com/photo-1560508180-03f285f67ded?auto=format&fit=crop&q=80', 'drinks', true, true, true),
  ('Snapple', 'Fruit juices (mango, peach tea, green apple).', 3.50, 'https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&q=80', 'drinks', true, false, true);

-- Combos
INSERT INTO menu_items (name, description, price, image_url, category, is_vegetarian, is_spicy, is_gluten_free)
VALUES
  ('Liberian Feast Platter', 'A combination of Jollof rice, cassava leaf stew, fried fish, and fried plantains.', 25.75, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80', 'combos', false, false, false),
  ('Mixed Meat Platter', 'Jerk chicken, curry chicken, fried fish, and a side of fried plantains and rice.', 27.95, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80', 'combos', false, false, false),
  ('Vegetarian Delight', 'Potatoes & greens, collard greens, mixed vegetables, and check rice with gravy.', 22.00, 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80', 'combos', true, false, false);

-- Extras
INSERT INTO menu_items (name, description, price, image_url, category, is_vegetarian, is_spicy, is_gluten_free)
VALUES
  ('Hot Pepper Sauce', 'Spicy sauce to add extra heat to any dish.', 2.00, 'https://images.unsplash.com/photo-1614113072255-5d109b5a1904?auto=format&fit=crop&q=80', 'extras', true, true, true),
  ('Liberian Spicy Sauce', 'Traditional Liberian spicy sauce.', 2.00, 'https://images.unsplash.com/photo-1614113072255-5d109b5a1904?auto=format&fit=crop&q=80', 'extras', true, true, true);