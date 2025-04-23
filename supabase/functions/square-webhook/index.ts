import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-square-signature',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get signature from headers
    const signature = req.headers.get('x-square-signature');
    if (!signature) {
      throw new Error('Missing Square signature');
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Verify signature
    const signatureKey = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');
    if (!signatureKey) {
      throw new Error('Missing webhook signature key');
    }

    const hmac = createHmac('sha256', signatureKey);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('base64');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log webhook
    const { data: webhook, error: webhookError } = await supabaseClient
      .from('square_webhooks')
      .insert({
        event_type: payload.type,
        payload,
        processed: false
      })
      .select()
      .single();

    if (webhookError) throw webhookError;

    // Process webhook based on event type
    switch (payload.type) {
      case 'inventory.count.updated':
        await handleInventoryUpdate(supabaseClient, payload.data);
        break;
      
      case 'catalog.version.updated':
        await handleCatalogUpdate(supabaseClient, payload.data);
        break;
    }

    // Mark webhook as processed
    await supabaseClient
      .from('square_webhooks')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', webhook.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleInventoryUpdate(supabase: any, data: any) {
  try {
    const catalogObjectId = data.object.catalogObjectId;
    const counts = data.object.counts || [];
    const latestCount = counts[0];

    if (!latestCount) return;

    await supabase
      .from('menu_items')
      .update({
        square_stock: latestCount.quantity,
        last_synced_at: new Date().toISOString()
      })
      .eq('square_variation_id', catalogObjectId);

  } catch (error) {
    console.error('Error handling inventory update:', error);
    throw error;
  }
}

async function handleCatalogUpdate(supabase: any, data: any) {
  try {
    // Log sync start
    const { data: syncLog } = await supabase
      .from('square_sync_logs')
      .insert({
        sync_type: 'catalog',
        status: 'in_progress'
      })
      .select()
      .single();

    // Update menu items with new catalog data
    const catalogObjectId = data.object.catalogObjectId;
    const { error: updateError } = await supabase
      .from('menu_items')
      .update({
        last_synced_at: null // Trigger resync
      })
      .eq('square_item_id', catalogObjectId);

    if (updateError) throw updateError;

    // Update sync log
    await supabase
      .from('square_sync_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        details: { catalog_object_id: catalogObjectId }
      })
      .eq('id', syncLog.id);

  } catch (error) {
    console.error('Error handling catalog update:', error);
    throw error;
  }
}