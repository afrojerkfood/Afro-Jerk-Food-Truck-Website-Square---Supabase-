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
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { orderId, nonce, amount } = JSON.parse(event.body);

    if (!orderId || !nonce || !amount) {
      throw new Error('Missing required payment fields');
    }

    console.log('Processing payment:', { orderId, amount });

    const { result } = await square.paymentsApi.createPayment({
      sourceId: nonce,
      idempotencyKey: `${orderId}_payment`,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID!
    });

    console.log('Payment processed:', result.payment);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.payment, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    };

  } catch (error: any) {
    console.error('Error processing payment:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message || 'Payment processing failed',
        details: error.errors?.[0]?.detail || error.stack
      }, (_, value) => 
        typeof value === 'bigint' ? value.toString() : value
      )
    };
  }
};
