import React, { useState, useEffect } from 'react';
import { Leaf, Flame, Wheat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

const CATEGORIES = [
  { id: 'signatures', name: '🍽️ Signature Plates' },
  { id: 'vegetarian', name: '🥦 Vegetarian & Vegan' },
  { id: 'sides', name: 'Sides' },
  { id: 'drinks', name: '🍹 Drinks' },
  { id: 'combos', name: '🍴 Combo Meals' },
  { id: 'dessert', name: '🍦 Desserts' },
  { id: 'extras', name: '🌶️ Extras' }

];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('signatures');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        console.log('Fetched menu items:', data);
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
  }, []);

  const filteredItems = menuItems.filter(item => {
    console.log('Filtering item:', item, 'activeCategory:', activeCategory);
    return item.category === activeCategory;
  });

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="bg-[#eb1924] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Discover our fusion of African and Caribbean flavors, crafted with authentic
            spices and fresh ingredients.
          </p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="sticky top-16 bg-white shadow-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-[#eb1924] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-2 text-center py-12">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              No items found in this category
            </div>
          ) : filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-6 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={item.image_url || ''}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <span className="text-lg font-bold text-[#eb1924]">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mt-1 mb-3">
                  {item.description}
                </p>

                <div className="flex gap-3">
                  {item.is_vegetarian && (
                    <span className="flex items-center gap-1 text-sm text-[#01a952]">
                      <Leaf className="w-4 h-4" />
                      Vegetarian
                    </span>
                  )}
                  {item.is_spicy && (
                    <span className="flex items-center gap-1 text-sm text-[#eb1924]">
                      <Flame className="w-4 h-4" />
                      Spicy
                    </span>
                  )}
                  {item.is_gluten_free && (
                    <span className="flex items-center gap-1 text-sm text-[#edba3a]">
                      <Wheat className="w-4 h-4" />
                      Gluten Free
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
