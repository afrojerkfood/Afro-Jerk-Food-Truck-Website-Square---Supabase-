import React, { useState } from 'react';
import { Calendar, Clock, Users, Phone, Mail, MapPin, ChevronRight, Utensils } from 'lucide-react';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  minQuantity: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'jollof-rice', name: 'Jollof Rice Pan (Serves 8-10)', price: 45.00, minQuantity: 2 },
  { id: 'jerk-chicken', name: 'Jerk Chicken Tray (24 pieces)', price: 65.00, minQuantity: 1 },
  { id: 'plantains', name: 'Fried Plantains Tray (Serves 15-20)', price: 35.00, minQuantity: 1 },
  { id: 'cassava-leaf', name: 'Cassava Leaf Stew Pan (Serves 8-10)', price: 55.00, minQuantity: 2 },
  { id: 'curry-chicken', name: 'Curry Chicken Tray (24 pieces)', price: 65.00, minQuantity: 1 },
  { id: 'rice', name: 'White Rice Pan (Serves 15-20)', price: 30.00, minQuantity: 1 }
];

export default function Catering() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    date: '',
    time: '',
    guests: '25',
    location: '',
    items: {} as Record<string, number>,
    notes: ''
  });

  const minDate = addDays(startOfToday(), 3); // 72 hours in advance

  const calculateTotal = () => {
    return Object.entries(formData.items).reduce((total, [itemId, quantity]) => {
      const item = MENU_ITEMS.find(i => i.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the order details for better readability
    const orderDetails = Object.entries(formData.items)
      .map(([itemId, quantity]) => {
        const item = MENU_ITEMS.find(i => i.id === itemId);
        return `${item?.name}: ${quantity}`;
      })
      .join('\n');

    const formattedData = {
      ...formData,
      orderDetails,
      total: calculateTotal(),
      'form-name': 'catering'
    };

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formattedData as any).toString()
      });

      if (response.ok) {
        alert('Thank you for your catering request! We will contact you shortly.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          date: '',
          time: '',
          guests: '25',
          location: '',
          items: {},
          notes: ''
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      alert('There was an error submitting your request. Please try again.');
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="bg-[#01a952] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Catering Services</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Bring the vibrant flavors of Africa and the Caribbean to your next event.
            We cater for groups of 20-100 people.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Hidden Netlify Form Detection */}
          <form name="catering" data-netlify="true" hidden>
            <input type="text" name="name" />
            <input type="email" name="email" />
            <input type="tel" name="phone" />
            <input type="text" name="company" />
            <input type="date" name="date" />
            <input type="time" name="time" />
            <input type="number" name="guests" />
            <input type="text" name="location" />
            <textarea name="orderDetails"></textarea>
            <input type="number" name="total" />
            <textarea name="notes"></textarea>
          </form>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Event Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date (72hrs notice required)
                  </label>
                  <input
                    type="date"
                    required
                    min={format(minDate, 'yyyy-MM-dd')}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="100"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Menu Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Menu Selection</h2>
              <div className="space-y-4">
                {MENU_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty = formData.items[item.id] || 0;
                          if (currentQty > 0) {
                            setFormData({
                              ...formData,
                              items: {
                                ...formData.items,
                                [item.id]: currentQty - 1
                              }
                            });
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">
                        {formData.items[item.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty = formData.items[item.id] || 0;
                          setFormData({
                            ...formData,
                            items: {
                              ...formData.items,
                              [item.id]: currentQty + 1
                            }
                          });
                        }}
                        className="w-8 h-8 rounded-full bg-[#01a952] flex items-center justify-center text-white hover:bg-[#01a952]/90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01a952] focus:border-transparent"
                rows={4}
                placeholder="Any special requests or dietary requirements?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#01a952] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#01a952]/90 transition-colors"
            >
              <Utensils className="w-5 h-5" />
              Submit Catering Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}