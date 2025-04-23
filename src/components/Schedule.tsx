import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { format, isSameDay, parse, startOfToday, addDays } from 'date-fns';
import { Link } from 'react-router-dom';


type Schedule = Database['public']['Tables']['schedules']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];

interface ScheduleWithLocation extends Schedule {
  location: Location;
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
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
        .order('date', { ascending: true })
        .limit(7);

      if (error) throw error;
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }

  // Generate array of next 7 days starting from today
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  const getScheduleForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return schedules.find(schedule => schedule.date === formattedDate);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Where to Find Us</h2>
        
        {loading ? (
          <div className="grid md:grid-cols-7 gap-4 mb-8">
            {Array(7).fill(null).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mb-8">{error}</div>
        ) : (
          <div className="grid md:grid-cols-7 gap-4 mb-8">
            {days.map((date) => {
              const schedule = getScheduleForDate(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div 
                  key={date.toISOString()}
                  className={`p-4 rounded-lg border ${
                    isToday
                      ? 'border-[#01a952] bg-[#01a952]/5' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    {format(date, 'EEE, MMM d')}
                  </div>
                  
                  {schedule ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#01a952] mt-1" />
                        <div>
                          <p className="font-medium">{schedule.location.name}</p>
                          <p className="text-sm text-gray-500">{schedule.location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(parse(schedule.start_time.slice(0, 5), 'HH:mm', new Date()), 'h:mm aa')} - {' '}
                          {format(parse(schedule.end_time.slice(0, 5), 'HH:mm', new Date()), 'h:mm aa')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      No schedule
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex justify-center">
          
          
            <Link
              to="/locate"
              className="flex items-center gap-2 border-2 border-[#01a952] text-[#01a952] px-6 py-3 rounded-full hover:bg-[#01a952] hover:text-white transition-colors"
            >
              <MapPin className="w-5 h-5" />
            Locate Our Truck
            </Link>
         
        </div>
      </div>
    </section>
  );
}