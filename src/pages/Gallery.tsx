import React, { useState } from 'react';
import { Camera, Users, MapPin } from 'lucide-react';

const GALLERY_ITEMS = [
  {
    id: '1',
    type: 'food',
    title: 'Jerk Chicken Platter',
    image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80',
    location: 'Charlotte Uptown',
    date: '2024-03-15'
  },
  {
    id: '2',
    type: 'event',
    title: 'Food Truck Friday',
    image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80',
    location: 'Rock Hill',
    date: '2024-03-10'
  },
  {
    id: '3',
    type: 'food',
    title: 'West African Peanut Stew',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80',
    location: 'Charlotte Uptown',
    date: '2024-03-08'
  },
  {
    id: '4',
    type: 'event',
    title: 'Community Festival',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80',
    location: 'Rock Hill',
    date: '2024-03-05'
  },
  {
    id: '5',
    type: 'food',
    title: 'Suya Beef Skewers',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80',
    location: 'Charlotte Uptown',
    date: '2024-03-01'
  },
  {
    id: '6',
    type: 'food',
    title: 'Jollof Rice Special',
    image: 'https://cnkalkntbjisvbpjtojk.supabase.co/storage/v1/object/public/media//jollof-rice-recipe-23.jpg',
    location: 'Rock Hill',
    date: '2024-02-28'
  }
];

const FILTERS = ['all', 'food', 'event'] as const;

type Filter = typeof FILTERS[number];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredItems = GALLERY_ITEMS.filter(
    item => activeFilter === 'all' || item.type === activeFilter
  );

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="bg-[#01a952] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Gallery</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Take a visual journey through our culinary creations and community events.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 bg-white shadow-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 py-4">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-6 py-2 rounded-full text-sm font-medium capitalize transition-colors
                  ${activeFilter === filter
                    ? 'bg-[#01a952] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl bg-black cursor-pointer"
              onClick={() => setSelectedImage(item.image)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover transition-transform group-hover:scale-105 group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <div className="flex flex-col gap-2 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={selectedImage}
              alt="Gallery"
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}