import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type Location = Database['public']['Tables']['locations']['Row'];

export default function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({});
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const addressDebounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchLocations();
    // Initialize geocoder
    if (window.google) {
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, []);

  const geocodeAddress = async (address: string) => {
    if (!geocoder.current) return;

    try {
      const result = await geocoder.current.geocode({ address });
      
      if (result.results[0]) {
        const { lat, lng } = result.results[0].geometry.location;
        setFormData(prev => ({
          ...prev,
          lat: lat(),
          lng: lng()
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to get coordinates for address');
    }
  };

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
    
    // Clear existing timeout
    if (addressDebounceTimeout.current) {
      clearTimeout(addressDebounceTimeout.current);
    }
    
    // Set new timeout to geocode after typing stops
    addressDebounceTimeout.current = setTimeout(() => {
      if (address.trim()) {
        geocodeAddress(address);
      }
    }, 1000);
  };

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.lat || !formData.lng) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingLocation) {
      try {
        const updates = {
          ...formData,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('locations')
          .update(updates)
          .eq('id', editingLocation.id);

        if (error) throw error;
        toast.success('Location updated successfully');
        fetchLocations();
        window.location.reload();
      } catch (error) {
        console.error('Error updating location:', error);
        toast.error('Failed to update location');
      }
    } else {
      try {
        const newLocation = {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('locations')
          .insert([newLocation]);

        if (error) throw error;
        toast.success('Location added successfully');
        fetchLocations();
        window.location.reload();
      } catch (error) {
        console.error('Error adding location:', error);
        toast.error('Failed to add location');
      }
    }
    
    setIsModalOpen(false);
    setEditingLocation(null);
    setFormData({});
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Location deleted successfully');
        fetchLocations();
      } catch (error) {
        console.error('Error deleting location:', error);
        toast.error('Failed to delete location');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Locations</h2>
        <button
          onClick={() => {
            setEditingLocation(null);
            setFormData({});
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#01a952] text-white px-4 py-2 rounded-lg hover:bg-[#01a952]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(null).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : filteredLocations.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No locations found
          </div>
        ) : (
          filteredLocations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={location.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80'}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-[#eb1924] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-[#eb1924] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium mb-2">{location.name}</h3>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-1" />
                  <p className="text-sm">{location.address}</p>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Coordinates: {location.lat}, {location.lng}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingLocation ? 'Edit Location' : 'Add Location'}
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
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat || ''}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                    required
                    placeholder="Updating..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng || ''}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                    required
                    placeholder="Updating..."
                  />
                </div>
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
                  placeholder="https://example.com/image.jpg"
                />
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
                  {editingLocation ? 'Update Location' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}