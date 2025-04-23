import type { Database } from './database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export class SquareService {
  /**
   * Create order in Square
   */
  static async createOrder(order: any) {
    try {
      const response = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      return await response.json();
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
      const response = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, nonce, amount })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}