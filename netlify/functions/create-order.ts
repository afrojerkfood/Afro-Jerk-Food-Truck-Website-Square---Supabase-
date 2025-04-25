import { Handler } from '@netlify/functions';
import { Client, Environment } from 'square';
import type { Order } from 'square';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  menuItem: {
    square_variation_id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface OrderRequest {
  order: {
    id: string;
    items: OrderItem[];
  };
}

const square = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const { order } = JSON.parse(event.body || '') as OrderRequest;

    const { result } = await square.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: order.items.map((item: any) => ({
          catalog_object_id: item.menuItem.square_variation_id,
          name: item.menuItem.name,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: Math.round(item.menuItem.price * 100), // Convert to cents
            currency: 'USD'
          }
        })),
        state: 'OPEN'
      },
      idempotencyKey: order.id
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.order, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    };

  } catch (error: any) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    };
  }
};
