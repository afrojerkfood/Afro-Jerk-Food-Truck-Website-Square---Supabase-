import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';

const MENU_ITEMS = [
 { path: '/order', label: 'Order Now' },
  { path: '/catering', label: 'Catering' },
  { path: '/menu', label: 'Menu' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="https://cnkalkntbjisvbpjtojk.supabase.co/storage/v1/object/public/media//favicon.png"
              alt="Afro Jerk Food Truck Logo"
              className="h-12 w-auto"
            />
            <span className="ml-3 text-xl font-bold text-gray-900" style={{ fontFamily: '"sanvito-pro", sans-serif' }}>AFRO JERK FOOD TRUCK</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-[#eb1924] ${
                  location.pathname === item.path ? 'text-[#eb1924]' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button className="flex items-center gap-2 bg-[#eb1924] text-white px-4 py-2 rounded-full text-sm hover:bg-[#eb1924]/90 transition-colors">
              <MapPin className="w-4 h-4" />
              <Link to="/locate">Find Us</Link>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  location.pathname === item.path ? 'text-[#eb1924]' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button className="flex items-center gap-2 bg-[#eb1924] text-white px-4 py-2 rounded-full text-sm w-full justify-center mt-4">
              <MapPin className="w-4 h-4" />
              <Link to="/locate">Find Us</Link>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}