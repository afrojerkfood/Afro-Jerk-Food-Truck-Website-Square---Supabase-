import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Receipt } from 'lucide-react';
import { format } from 'date-fns';

interface OrderConfirmationProps {
  state: {
    order: {
      id: string;
      customer_name: string;
      customer_email: string;
      pickup_time: string;
      total_amount: number;
      location_name: string;
      items: Array<{
        menuItem: {
          name: string;
          price: number;
        };
        quantity: number;
      }>;
    };
  };
}

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  // If there's no order in the state, redirect to the order page
  if (!order) {
    return <Navigate to="/order" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#01a952]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-[#01a952]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">
                Thank you for your order, {order.customer_name}! We've sent a confirmation email to {order.customer_email}.
              </p>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Order ID */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Order ID</div>
                <div className="font-medium">{order.id}</div>
              </div>

              {/* Pickup Details */}
              <div className="border-t pt-6">
                <h2 className="font-bold mb-4">Pickup Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>{format(new Date(order.pickup_time), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{format(new Date(order.pickup_time), 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{order.location_name}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-6">
                <h2 className="font-bold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-600">
                      <div className="flex gap-2">
                        <span>{item.quantity}x</span>
                        <span>{item.menuItem.name}</span>
                      </div>
                     <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total</span>
                   <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-[#01a952] text-white px-6 py-3 rounded-full hover:bg-[#01a952]/90 transition-colors"
              >
                Return to Home
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 border-2 border-[#01a952] text-[#01a952] px-6 py-3 rounded-full hover:bg-[#01a952] hover:text-white transition-colors"
              >
                <Receipt className="w-5 h-5" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}