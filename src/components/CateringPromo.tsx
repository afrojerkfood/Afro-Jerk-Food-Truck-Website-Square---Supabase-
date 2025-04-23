import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, ChevronRight } from 'lucide-react';

export default function CateringPromo() {
  return (
    <section className="py-16 bg-[#edba3a]/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#edba3a]/5 to-transparent" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Image */}
              <div className="w-full md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80"
                  alt="Catering Setup"
                  className="w-full h-64 object-cover rounded-xl shadow-md"
                />
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex items-center gap-2 text-[#edba3a]">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">20-100 Guests</span>
                </div>

                <h2 className="text-3xl font-bold">We Cater!</h2>
                <p className="text-gray-600">
                  Bring the authentic flavors of Africa and the Caribbean to your next event.
                  From corporate lunches to family celebrations, we'll make it unforgettable.
                </p>

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">72 hours advance notice required</span>
                </div>

                <Link
                  to="/catering"
                  className="inline-flex items-center gap-2 bg-[#edba3a] text-white px-6 py-3 rounded-full hover:bg-[#edba3a]/90 transition-colors group"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}