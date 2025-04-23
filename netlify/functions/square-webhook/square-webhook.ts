import { Handler } from '@netlify/functions';
import { createHmac } from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-square-signature',
};

export const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Get signature from headers
    const signature = event.headers['x-square-signature'];
    if (!signature) {
      throw new Error('Missing Square signature');
    }

    // Verify signature
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (!signatureKey) {
      throw new Error('Missing webhook signature key');
    }

    const hmac = createHmac('sha256', signatureKey);
    hmac.update(event.body || '');
    const expectedSignature = hmac.digest('base64');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    // Parse payload
    const payload = JSON.parse(event.body || '');

    // Process webhook based on event type
    switch (payload.type) {
      case 'inventory.count.updated':
        await handleInventoryUpdate(payload.data);
        break;
      
      case 'catalog.version.updated':
        await handleCatalogUpdate(payload.data);
        break;
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true })
    };

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function handleInventoryUpdate(data: any) {
  try {
    const catalogObjectId = data.object.catalogObjectId;
    const counts = data.object.counts || [];
    const latestCount = counts[0];

    if (!latestCount) return;

    // Update inventory in Square
    const response = await fetch(`${process.env.SQUARE_API_URL}/inventory/counts`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idempotencyKey: `${catalogObjectId}_${Date.now()}`,
        counts: [{
          catalogObjectId,
          quantity: latestCount.quantity.toString()
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update inventory');
    }

  } catch (error) {
    console.error('Error handling inventory update:', error);
    throw error;
  }
}

async function handleCatalogUpdate(data: any) {
  try {
    const catalogObjectId = data.object.catalogObjectId;

    // Fetch updated catalog item from Square
    const response = await fetch(`${process.env.SQUARE_API_URL}/catalog/object/${catalogObjectId}`, {
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch catalog item');
    }

    const catalogItem = await response.json();
    console.log('Updated catalog item:', catalogItem);

  } catch (error) {
    console.error('Error handling catalog update:', error);
    throw error;
  }
}