import { Handler } from '@netlify/functions';
import { Client, Environment } from 'square';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { order } = JSON.parse(event.body || '');

    const { result } = await square.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: order.items.map((item: any) => ({
          catalogObjectId: item.menuItem.square_variation_id,
          quantity: item.quantity.toString()
        })),
        state: 'OPEN'
      },
      idempotencyKey: order.id
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.order)
    };

  } catch (error: any) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};