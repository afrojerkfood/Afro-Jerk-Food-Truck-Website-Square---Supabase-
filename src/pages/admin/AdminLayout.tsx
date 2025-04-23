import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Utensils, CalendarDays, FileText, ShoppingBag, LogOut, Menu, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const ADMIN_MENU = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/menu', label: 'Menu', icon: Utensils },
  { path: '/admin/schedule', label: 'Schedule', icon: CalendarDays },
  { path: '/admin/blog', label: 'Blog', icon: FileText },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50">
        <div className="flex flex-col h-full">
          <Link to="/" className="flex items-center p-4 border-b">
            <img 
              src="https://cnkalkntbjisvbpjtojk.supabase.co/storage/v1/object/public/media//afro%20jerk%20logo@0.5x.png"
              alt="Afro Jerk Logo"
              className="h-8 w-auto"
            />
       <span className="ml-4 text-xl font-bold text-gray-900" style={{ fontFamily: '"sanvito-pro", sans-serif' }}>Afro Jerk Admin</span>
          </Link> 

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {ADMIN_MENU.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                      ${isActive
                        ? 'bg-[#eb1924]/10 text-[#eb1924]'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between p-4">
          <Link className="flex items-center" to="/">
            <img 
              src="https://cnkalkntbjisvbpjtojk.supabase.co/storage/v1/object/public/media//afro%20jerk%20logo@0.5x.png"
              alt="Afro Jerk Logo"
              className="h-8 w-auto"
            />
                 <span className="ml-4 text-xl font-bold text-gray-900" style={{ fontFamily: '"sanvito-pro", sans-serif' }}>Afro Jerk Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="p-4">
              <ul className="space-y-1">
                {ADMIN_MENU.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/admin'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                        ${isActive
                          ? 'bg-[#eb1924]/10 text-[#eb1924]'
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-8 pt-20 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}