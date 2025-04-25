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

const PaymentForm = ({ amount, orderId, onSuccess, onError }: PaymentFormProps) => {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applicationId = 'sandbox-sq0idb-G1yqU0DZ2g7Fgwd8prwbRw';
  const locationId = 'LHYHR6Y7X33KQ';

  useEffect(() => {
    if (!applicationId || !locationId) {
      console.error('Missing Square configuration:', { applicationId, locationId });
      setError('Payment system configuration is incomplete. Please try again later.');
      return;
    }

    // Load Square Web Payments SDK
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = initializeSquare;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [applicationId, locationId]);

  async function initializeSquare() {
    if (!window.Square) {
      console.error('Square SDK not loaded');
      return;
    }

    try {
      const payments = window.Square.payments(applicationId, locationId);

      if (!payments) {
        throw new Error('Failed to initialize Square payments');
      }

      const card = await payments.card();
      await card.attach('#card-container');
      setCard(card);
    } catch (error) {
      setError((error as Error).message);
      console.error('Error initializing Square:', error);
      onError(error as Error);
      return;
    }
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!card) {
      toast.error('Payment form not initialized');
      setError('Payment system not ready. Please refresh and try again.');
      return;
    }

    setLoading(true);

    try {
      const result = await card.tokenize();
      if (result.status === 'OK') {
        // Process payment with Square
        const payment = await SquareService.processPayment(
          orderId,
          result.token,
          amount
        );
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

        {error ? (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        ) : (
          <div 
            id="card-container"
            className="p-4 border border-gray-300 rounded-lg mb-4 min-h-[100px]"
          />
        )}

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
};

export default PaymentForm;
