import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import type { Database } from '../../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface OrderWithDetails extends Order {
  location: Location;
  items: Array<{
    quantity: number;
    menu_item: MenuItem;
  }>;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  activeLocations: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    uniqueCustomers: 0,
    activeLocations: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<OrderWithDetails[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentOrders();
  }, []);

  async function fetchRecentOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          location:locations(*),
          items:order_items(
            quantity,
            menu_item:menu_items(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentOrders(data);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  }

  async function fetchDashboardStats() {
    try {
      // Get current date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

      // Fetch current period stats
      const { data: currentOrders, error: currentError } = await supabase
        .from('orders')
        .select('id, total_amount, customer_email, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (currentError) throw currentError;

      // Fetch previous period stats
      const { data: previousOrders, error: previousError } = await supabase
        .from('orders')
        .select('id, total_amount, customer_email, created_at')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (previousError) throw previousError;

      // Fetch active locations
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('id');

      if (locationsError) throw locationsError;

      // Calculate current period metrics
      const currentRevenue = currentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const currentOrderCount = currentOrders?.length || 0;
      const currentCustomers = new Set(currentOrders?.map(order => order.customer_email)).size;

      // Calculate previous period metrics
      const previousRevenue = previousOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const previousOrderCount = previousOrders?.length || 0;
      const previousCustomers = new Set(previousOrders?.map(order => order.customer_email)).size;

      // Calculate percentage changes
      const revenueChange = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      const ordersChange = previousOrderCount === 0 ? 100 : ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100;
      const customersChange = previousCustomers === 0 ? 100 : ((currentCustomers - previousCustomers) / previousCustomers) * 100;

      setStats({
        totalRevenue: currentRevenue,
        totalOrders: currentOrderCount,
        uniqueCustomers: currentCustomers,
        activeLocations: locations?.length || 0,
        revenueChange,
        ordersChange,
        customersChange
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const STATS = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%`,
      trend: stats.revenueChange >= 0 ? 'up' : 'down',
      icon: DollarSign
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: `${stats.ordersChange > 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}%`,
      trend: stats.ordersChange >= 0 ? 'up' : 'down',
      icon: TrendingUp
    },
    {
      label: 'Total Customers',
      value: stats.uniqueCustomers.toString(),
      change: `${stats.customersChange > 0 ? '+' : ''}${stats.customersChange.toFixed(1)}%`,
      trend: stats.customersChange >= 0 ? 'up' : 'down',
      icon: Users
    },
    {
      label: 'Active Locations',
      value: stats.activeLocations.toString(),
      change: '-',
      trend: 'neutral',
      icon: MapPin
    }
  ];

  return (
    <div>
      <div className="mb-8 mt-12">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          // Loading skeletons for stats
          Array(4).fill(null).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#eb1924]/10 rounded-lg">
                <stat.icon className="w-6 h-6 text-[#eb1924]" />
              </div>
              {stat.trend !== 'neutral' && (
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-[#01a952]' : 'text-[#eb1924]'
                }`}>
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold">Recent Orders ({recentOrders.length})</h2>
        </div>
        
        <div className="divide-y">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{order.customer_name}</h3>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {order.items.map(item => 
                      `${item.quantity}x ${item.menu_item.name}`
                    ).join(', ')}
                  </p>
                  <p className="text-sm font-medium mt-1">${order.total_amount.toFixed(2)}</p>
                </div>
                
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${order.status === 'completed' ? 'bg-[#01a952]/10 text-[#01a952]' :
                    order.status === 'preparing' ? 'bg-[#edba3a]/10 text-[#edba3a]' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-[#fff9db] text-[#9a7800]'}
                `}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No recent orders
            </div>
          )}
        </div>
      </div>
    </div>
  );
}