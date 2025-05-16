import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Camera, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];

const TYPES = ['food', 'event'] as const;

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({});

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  async function fetchGalleryItems() {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image_url || !formData.location || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingItem) {
      try {
        const { error } = await supabase
          .from('gallery_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Gallery item updated successfully');
        fetchGalleryItems();
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
      } catch (error) {
        console.error('Error updating gallery item:', error);
        toast.error('Failed to update gallery item');
      }
    } else {
      try {
        const { error } = await supabase
          .from('gallery_items')
          .insert([{
            ...formData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success('Gallery item added successfully');
        fetchGalleryItems();
        setIsModalOpen(false);
        setFormData({});
      } catch (error) {
        console.error('Error adding gallery item:', error);
        toast.error('Failed to add gallery item');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const { error } = await supabase
          .from('gallery_items')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Gallery item deleted successfully');
        fetchGalleryItems();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        toast.error('Failed to delete gallery item');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 mt-12">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-gray-600">Manage your gallery items</p>
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

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search gallery items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(null).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-xl"></div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No gallery items found
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setFormData(item);
                      setIsModalOpen(true);
                    }}
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
                <h3 className="font-medium mb-2">{item.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
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
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
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
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof TYPES[number] })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent capitalize"
                  required
                >
                  <option value="">Select a type</option>
                  {TYPES.map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type}
                    </option>
                  ))}
                </select>
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
