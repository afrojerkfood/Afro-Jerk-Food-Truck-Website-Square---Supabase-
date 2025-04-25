import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, parse, addMinutes, isBefore, isEqual, isValid } from 'date-fns';
import { Clock, Calendar, Users, MapPin, ChevronLeft, ChevronRight, ShoppingBag, Leaf, Flame, Wheat, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { supabase } from '../lib/supabase';
import { SquareService } from '../lib/square';
import { toast } from 'react-hot-toast';
import type { Database } from '../lib/database.types';

type Location = Database['public']['Tables']['locations']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Schedule = Database['public']['Tables']['schedules']['Row'];

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function Order() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('signatures');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [menuCategories] = useState(['signatures', 'vegetarian', 'sides', 'drinks', 'combos', 'dessert', 'extras']);
  const [pickupDateTime, setPickupDateTime] = useState<Date | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchLocations();
    fetchMenuItems();
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    try {
      const { data, error } = await supabase
        .from('schedules').select('*')
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    }
  }

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*');

      if (error) throw error;
      setLocations(data);
      if (data.length > 0) setSelectedLocation(data[0]);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  }

  async function fetchMenuItems() {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');

      if (error) throw error;
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItem.id === menuItem.id);
      if (existingItem?.quantity === 1) {
        return prev.filter(item => item.menuItem.id !== menuItem.id);
      }
      return prev.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const availableDates = useMemo(() => {
    const dates = [...new Set(schedules.map(schedule => schedule.date))];
    return dates.map(date => parseISO(date));
  }, [schedules]);

  const availableTimes = useMemo(() => {
    if (!selectedDate || !selectedLocation) return [];
    
    const schedule = schedules.find(s => 
      s.date === format(selectedDate, 'yyyy-MM-dd') &&
      s.location_id === selectedLocation.id
    );

    if (!schedule) return [];

    const times: string[] = [];
    
    const startTime = schedule.start_time.slice(0, 5);
    const endTime = schedule.end_time.slice(0, 5);
    
    let currentTime = parse(startTime, 'HH:mm', new Date());
    const parsedEndTime = parse(endTime, 'HH:mm', new Date());

    if (!isValid(currentTime) || !isValid(parsedEndTime)) {
      console.error('Invalid time format in schedule');
      return [];
    }

    while (isBefore(currentTime, parsedEndTime)) {
      times.push(format(currentTime, 'h:mm aa'));
      currentTime = addMinutes(currentTime, 30);
    }

    if (format(currentTime, 'HH:mm') === endTime) {
      times.push(format(currentTime, 'h:mm aa'));
    }

    return times;
  }, [selectedDate, selectedLocation, schedules]);

  const handleContinue = () => {
    if (step === 3) {
      const currentIndex = menuCategories.indexOf(selectedCategory);
      if (currentIndex < menuCategories.length - 1) {
        setSelectedCategory(menuCategories[currentIndex + 1]);
      } else {
        setStep(4);
      }
    } else if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      const currentIndex = menuCategories.indexOf(selectedCategory);
      if (currentIndex > 0) {
        setSelectedCategory(menuCategories[currentIndex - 1]);
      } else {
        setStep(2);
      }
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLocation || !selectedTime || cart.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // Validate time format
      const parsedTime = parse(selectedTime, 'h:mm aa', new Date());
      if (!isValid(parsedTime)) {
        throw new Error('Invalid time format');
      }

      // Validate date
      if (!isValid(selectedDate)) {
        throw new Error('Invalid pickup date');
      }

      const time24 = format(parsedTime, 'HH:mm');
      const dateTime = parseISO(`${format(selectedDate, 'yyyy-MM-dd')}T${time24}:00`);
      setPickupDateTime(dateTime);
      const totalAmount = calculateTotal();

      // Create order in Supabase first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          location_id: selectedLocation.id,
          total_amount: totalAmount,
          pickup_time: dateTime.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items in Supabase
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create Square order
      const { squareOrderId } = await SquareService.createOrder({
        id: order.id,
        items: cart
      });

      // Update order with Square order ID
      await supabase
        .from('orders')
        .update({ 
          square_order_id: squareOrderId
        })
        .eq('id', order.id);

      // Show payment form
      setOrderId(squareOrderId);
      setShowPayment(true);
      setStep(4);

    } catch (error: any) {
      console.error('Error submitting order:', error);
      let errorMessage = 'Failed to place order';
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.details || errorData.error || errorMessage;
      } catch {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    if (!orderId) return;
    if (!pickupDateTime) {
      console.error('Missing pickup date/time');
      toast.error('Error processing order: Missing pickup time');
      return;
    }

    try {
      // Get original order ID from Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('square_order_id', orderId)
        .single();

      if (orderError) throw orderError;

      // Update order with payment ID and status
      await supabase
        .from('orders')
        .update({ square_payment_id: paymentId })
        .eq('id', orderData.id);

      // Navigate to confirmation page
      navigate('/order/confirmation', {
        state: {
          order: { 
            id: orderId, 
            ...customerInfo, 
            items: cart,
            pickup_time: pickupDateTime.toISOString(),
            total_amount: calculateTotal(),
            location_name: selectedLocation?.name 
          } 
        }
      });
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast.error('Error processing order confirmation');
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <div className="bg-[#edba3a] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Order & Book</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Place your order for pickup or reserve a spot at our food truck locations.
          </p>
          <a
            href="tel:+17045550123"
            className="inline-flex items-center gap-2 mt-6 bg-white text-[#edba3a] px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-medium
                  ${i === step ? 'bg-[#edba3a] text-white' : 
                    i < step ? 'bg-[#01a952] text-white' : 
                    'bg-gray-100 text-gray-400'}
                `}>
                  {i}
                </div>
                {i < 4 && (
                  <div className={`
                    w-24 h-1 mx-2
                    ${i < step ? 'bg-[#01a952]' : 'bg-gray-100'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Your Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#edba3a] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#edba3a] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#edba3a] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Select Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location)}
                      className={`
                        relative overflow-hidden rounded-xl hover:shadow-lg transition-shadow
                        ${location.id === selectedLocation?.id ? 
                          'ring-2 ring-[#edba3a]' : 'border border-gray-200'}
                      `}
                    >
                      <img 
                        src={location.image_url}
                        alt={location.name}
                        className="h-32 bg-gray w-full object-cover"
                      />
                      <div className="p-4 text-left">
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-sm text-gray-500">{location.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Select Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-3 rounded-lg text-center hover:bg-gray-50 transition-colors
                        ${isEqual(date, selectedDate) ? 
                          'bg-[#edba3a]/10 border-2 border-[#edba3a] text-[#edba3a]' : 
                          'border border-gray-200'}
                      `}
                    >
                      <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                      <div className="font-medium">{format(date, 'd')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Select Time</h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          p-3 rounded-lg text-center hover:bg-gray-50 transition-colors
                          ${time === selectedTime ? 
                            'bg-[#edba3a]/10 border-2 border-[#edba3a] text-[#edba3a]' : 
                            'border border-gray-200'}
                        `}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-4 text-center text-gray-500 py-4">
                      No available time slots for this date.
                      Please select a different date.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Select Menu Items</h3>
                
                <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar">
                  {menuCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap
                        ${selectedCategory === category
                          ? 'bg-[#edba3a] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {menuItems
                    .filter(item => item.category === selectedCategory)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={item.image_url || ''}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="font-medium text-[#eb1924]">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {item.is_vegetarian && (
                                <span className="flex items-center gap-1 text-sm text-[#01a952]">
                                  <Leaf className="w-4 h-4" />
                                </span>
                              )}
                              {item.is_spicy && (
                                <span className="flex items-center gap-1 text-sm text-[#eb1924]">
                                  <Flame className="w-4 h-4" />
                                </span>
                              )}
                              {item.is_gluten_free && (
                                <span className="flex items-center gap-1 text-sm text-[#edba3a]">
                                  <Wheat className="w-4 h-4" />
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeFromCart(item)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">
                                {cart.find(cartItem => cartItem.menuItem.id === item.id)?.quantity || 0}
                              </span>
                              <button
                                onClick={() => addToCart(item)}
                                className="w-8 h-8 rounded-full bg-[#edba3a] flex items-center justify-center text-white hover:bg-[#edba3a]/90"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && !showPayment && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-6">Review Your Order</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Order Items</h4>
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.menuItem)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item.menuItem)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            +
                          </button>
                        </div>
                        <span>{item.menuItem.name}</span>
                      </div>
                     <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-medium flex justify-between">
                    <span>Total</span>
                   <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{selectedTime}</span>
                </div>
                
                {selectedLocation && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <div>
                      <div>{selectedLocation.name}</div>
                      <div className="text-sm text-gray-500">{selectedLocation.address}</div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full mt-8 bg-[#01a952] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#01a952]/90 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Place Order
              </button>
            </div>
          )}
          
          {step === 4 && showPayment && orderId && (
            <PaymentForm
              amount={calculateTotal()}
              orderId={orderId}
              onSuccess={handlePaymentSuccess}
              onError={(error) => {
                console.error('Payment error:', error);
                toast.error(error.message || 'Payment failed');
              }}
            />
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}
            
            {step < 4 && (
              <button
                onClick={handleContinue}
                disabled={step === 3 && cart.length === 0}
                className="flex items-center gap-2 text-white bg-[#edba3a] px-6 py-2 rounded-full hover:bg-[#edba3a]/90 transition-colors"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
