import React from 'react';
import { useState, useEffect } from 'react';
import { Utensils, Leaf, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export default function MenuPreview() {
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedDishes() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('category', 'signatures')
          .limit(3);

        if (error) throw error;
        setFeaturedDishes(data);
      } catch (error) {
        console.error('Error fetching featured dishes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedDishes();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Dishes</h2>
        
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredDishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={dish.image_url || ''} 
                    alt={dish.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{dish.name}</h3>
                    <span className="text-lg font-bold text-[#eb1924]">
                      ${dish.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{dish.description}</p>
                  
                  <div className="flex gap-2">
                    {dish.is_vegetarian && (
                      <span className="flex items-center gap-1 text-sm text-[#01a952]">
                        <Leaf className="w-4 h-4" />
                        Vegetarian
                      </span>
                    )}
                    {dish.is_spicy && (
                      <span className="flex items-center gap-1 text-sm text-[#eb1924]">
                        <Flame className="w-4 h-4" />
                        Spicy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center">
          <Link 
            to="/menu"
            className="flex items-center gap-2 bg-[#edba3a] text-white px-8 py-4 rounded-full hover:bg-[#edba3a]/90 transition-colors"
          >
            <Utensils className="w-5 h-5" />
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}