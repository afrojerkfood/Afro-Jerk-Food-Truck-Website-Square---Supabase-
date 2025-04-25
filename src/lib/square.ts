import type { Database } from './database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export class SquareService {
  /**
   * Create order in Square
   */
  static async createOrder(order: any) {
    try {
      console.log('Creating Square order:', order);
      const response = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Error creating Square order:', error);
      throw error;
    }
  }

  /**
   * Process payment in Square
   */
  static async processPayment(orderId: string, nonce: string, amount: number) {
    try {
      console.log('Processing payment:', { orderId, amount });
      const response = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, nonce, amount })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}
