import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Clock, Calendar, Pencil, Trash2, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import LocationsManager from '../../components/admin/LocationsManager';
import type { Database } from '../../lib/database.types';
import { format, addDays, isSameDay, startOfToday, parse } from 'date-fns';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface ScheduleWithLocation extends Schedule {
  location: Location;
}

const AVAILABLE_TIMES = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM'
];

export default function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleWithLocation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleWithLocation | null>(null);
  const [formData, setFormData] = useState<Partial<Schedule>>({});

  // Generate array of next 7 days starting from today
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    fetchSchedule();
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*');

      if (error) throw error;
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  }

  async function fetchSchedule() {
    try {
      // Get today's date at start of day in local timezone
      const today = startOfToday();
      const formattedDate = format(today, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          location:locations(*)
        `)
        .gte('date', formattedDate)
        .order('date', { ascending: true });

      if (error) throw error;
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }

  const filteredSchedule = schedule.filter(event => {
    const location = event.location;
    const matchesSearch = location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location?.address.toLowerCase().includes(searchTerm.toLowerCase());
    const eventDate = parse(event.date, 'yyyy-MM-dd', new Date());
    const matchesDate = isSameDay(eventDate, selectedDate);
    return matchesSearch && matchesDate;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.location_id || !formData.date || !formData.start_time || !formData.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingEvent) {
      try {
        const updates = {
          ...formData,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('schedules')
          .update(updates)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Schedule updated successfully');
        fetchSchedule();
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormData({});
      } catch (error) {
        console.error('Error updating schedule:', error);
        toast.error('Failed to update schedule');
      }
    } else {
      try {
        const newEvent = {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('schedules')
          .insert([newEvent]);

        if (error) throw error;
        toast.success('Schedule added successfully');
        fetchSchedule();
        setIsModalOpen(false);
        setFormData({});
      } catch (error) {
        console.error('Error adding schedule:', error);
        toast.error('Failed to add schedule');
      }
    }
  };

  const handleEdit = (event: ScheduleWithLocation) => {
    setEditingEvent(event);
    setFormData(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        const { error } = await supabase
          .from('schedules')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Schedule deleted successfully');
        fetchSchedule();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 mt-12 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-gray-600">Manage your food truck locations and times</p>
        </div>
        
        
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({});
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#01a952] text-white px-4 py-2 rounded-lg hover:bg-[#01a952]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Schedule
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
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 no-scrollbar">
            {dates.map((date) => (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  isSameDay(date, selectedDate)
                    ? 'bg-[#eb1924] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {format(date, 'MMM d')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
        {filteredSchedule.map((event) => {
          const location = event.location;
          
          return (
            <div
              key={event.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{location?.name}</h3>
                    <span className="text-sm text-gray-500">{location?.address}</span>
                  </div>

                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(parse(event.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(parse(event.start_time.slice(0, 5), 'HH:mm', new Date()), 'h:mm aa')} - {' '}
                        {format(parse(event.end_time.slice(0, 5), 'HH:mm', new Date()), 'h:mm aa')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {location?.lat}, {location?.lng}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchedule.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No schedules found for this date
          </div>
        )}
      </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingEvent ? 'Edit Schedule' : 'Add Schedule'}
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
                  Location
                </label>
                <select
                  value={formData.location_id || ''}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                    required
                  />
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
                  {editingEvent ? 'Update Schedule' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Locations Manager */}
      <div className="mt-12 pt-12 border-t">
        <LocationsManager />
      </div>
    </div>
  );
}