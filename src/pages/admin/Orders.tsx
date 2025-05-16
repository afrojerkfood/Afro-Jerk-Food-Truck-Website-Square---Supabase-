import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Clock, MapPin } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { format } from 'date-fns';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  menu_item: Database['public']['Tables']['menu_items']['Row']
};
type Location = Database['public']['Tables']['locations']['Row'];

const STATUSES = ['all', 'pending', 'preparing', 'completed', 'cancelled'] as const;

type Status = typeof STATUSES[number];

export default function Orders() {
  const [orders, setOrders] = useState<(Order & { 
    location: Location, 
    items: OrderItem[] 
  })[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
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

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          location:locations(*),
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || order.location.id === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  async function handleStatusChange(orderId: string, newStatus: Status) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#01a952]/10 text-[#01a952]';
      case 'preparing':
        return 'bg-[#edba3a]/10 text-[#edba3a]';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
       return 'bg-[#fff9db] text-[#9a7800]';

    }
  };

  return (
    <div>
      <div className="mb-8 mt-12">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status)}
              className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent capitalize"
            >
              {STATUSES.map(status => (
                <option key={status} value={status} className="capitalize">
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        ) : (
        <div className="divide-y">
          {filteredOrders.map((order) => (
            <div 
              key={order.id}
              className={`
                p-6 hover:bg-gray-50 cursor-pointer transition-colors
                ${selectedOrder === order.id ? 'bg-gray-50' : ''}
              `}
              onClick={() => setSelectedOrder(order.id === selectedOrder ? null : order.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-medium">{order.id}</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Status)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium capitalize cursor-pointer
                      border-0 focus:ring-2 focus:ring-offset-2
                      ${getStatusColor(order.status)}
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {STATUSES.filter(status => status !== 'all').map(status => (
                      <option 
                        key={status} 
                        value={status}
                        className="bg-white text-gray-900 capitalize"
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {format(new Date(order.created_at), 'h:mm aa')}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {order.location.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {format(new Date(order.pickup_time), 'h:mm a')}
                  </div>
                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Order Details */}
              {selectedOrder === order.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.menu_item.name}
                        </span>
                        <span className="text-gray-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total</span>
                      <span>${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
