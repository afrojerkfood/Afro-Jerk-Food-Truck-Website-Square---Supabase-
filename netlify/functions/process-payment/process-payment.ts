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
    const { orderId, nonce, amount } = JSON.parse(event.body || '');

    const { result } = await square.paymentsApi.createPayment({
      sourceId: nonce,
      idempotencyKey: `${orderId}_payment`,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      },
      orderId: orderId
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.payment)
    };

  } catch (error: any) {
    console.error('Error processing payment:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};