import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Leaf, Flame, Wheat } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

const CATEGORIES = ['all', 'signatures', 'vegetarian', 'sides', 'drinks', 'combos', 'dessert', 'extras'] as const;

type Category = typeof CATEGORIES[number];

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});

  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');

      if (error) throw error;
      setItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
      (item.category as string) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Ensure price is positive
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (editingItem) {
      try {
        const updates = {
          ...formData,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('menu_items')
          .update(updates)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Menu item updated successfully');
        fetchMenuItems();
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
      } catch (error) {
        console.error('Error updating menu item:', error);
        toast.error('Failed to update menu item');
      }
    } else {
      try {
        const newItem = {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('menu_items')
          .insert([newItem]);

        if (error) throw error;
        toast.success('Menu item added successfully');
        fetchMenuItems();
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
      } catch (error) {
        console.error('Error adding menu item:', error);
        toast.error('Failed to add menu item');
      }
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Menu item deleted successfully');
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8 mt-12">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-gray-600">Manage your menu items</p>
        </div>
        
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({});
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#01a952] text-white px-4 py-2 rounded-lg hover:bg-[#01a952]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium capitalize
                  ${categoryFilter === category
                    ? 'bg-[#eb1924] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-48 relative overflow-hidden">
              <img
                src={item.image_url || ''}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-[#eb1924] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-[#eb1924] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-medium">{item.name}</h3>
                <span className="font-medium text-[#eb1924]">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {item.description}
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                  {item.category}
                </span>
                
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
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setFormData({ ...formData, price: value });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItem['category'] })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent capitalize"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_vegetarian || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_vegetarian: e.target.checked
                      })}
                      className="rounded border-gray-300 text-[#01a952] focus:ring-[#01a952]"
                    />
                    <span className="text-sm">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_spicy || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_spicy: e.target.checked
                      })}
                      className="rounded border-gray-300 text-[#eb1924] focus:ring-[#eb1924]"
                    />
                    <span className="text-sm">Spicy</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_gluten_free || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_gluten_free: e.target.checked
                      })}
                      className="rounded border-gray-300 text-[#edba3a] focus:ring-[#edba3a]"
                    />
                    <span className="text-sm">Gluten Free</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#01a952] text-white hover:bg-[#01a952]/90 transition-colors"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}