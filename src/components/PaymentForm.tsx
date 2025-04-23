import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SquareService } from '../lib/square';

interface PaymentFormProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: Error) => void;
}

declare global {
  interface Window {
    Square: any;
  }
}

export default function PaymentForm({ amount, orderId, onSuccess, onError }: PaymentFormProps) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = initializeSquare;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  async function initializeSquare() {
    if (!window.Square) {
      console.error('Square SDK not loaded');
      return;
    }

    try {
      const payments = window.Square.payments(import.meta.env.VITE_SQUARE_ACCESS_TOKEN, import.meta.env.VITE_SQUARE_LOCATION_ID);
      const card = await payments.card();
      await card.attach('#card-container');
      setCard(card);
    } catch (error) {
      console.error('Error initializing Square:', error);
      onError(error as Error);
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!card) {
      toast.error('Payment form not initialized');
      return;
    }

    setLoading(true);

    try {
      const result = await card.tokenize();
      if (result.status === 'OK') {
        // Process payment with Square
        const payment = await SquareService.processPayment(orderId, result.token, amount);
        if (payment?.id) {
          onSuccess(payment.id);
        } else {
          throw new Error('Payment failed');
        }
      } else {
        throw new Error(result.errors[0].message);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Payment Details</h3>
        
        {/* Card Input Container */}
        <div 
          id="card-container"
          className="p-4 border border-gray-300 rounded-lg mb-4 min-h-[100px] focus-within:ring-2 focus-within:ring-[#eb1924] focus-within:border-transparent"
        />

        {/* Total Amount */}
        <div className="flex justify-between items-center font-bold">
          <span>Total:</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !card}
        className="w-full bg-[#01a952] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#01a952]/90 transition-colors disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}