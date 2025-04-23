import { Resend } from 'npm:resend@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const resend = new Resend(resendApiKey);
    const { order } = await req.json();

    console.log('Processing order:', {
      id: order.id,
      customer: order.customer_name,
      location: order.location_name,
      items: order.items?.length
    });

    const pickupTime = new Date(order.pickup_time).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    const orderItemsHtml = order.items
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.menuItem.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${(item.menuItem.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const { data, error } = await resend.emails.send({
      from: 'orders@afrojerk.com',
      to: order.customer_email,
      subject: 'Order Confirmation - Afro Jerk Food Truck',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #edba3a;">Thank you for your order!</h1>
          <p>Hi ${order.customer_name},</p>
          <p>Your order has been confirmed and will be ready for pickup at ${pickupTime}.</p>
          
          <h2>Order Details:</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Pickup Location:</strong> ${order.location_name}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="text-align: left; padding: 8px;">Item</th>
                <th style="text-align: left; padding: 8px;">Quantity</th>
                <th style="text-align: left; padding: 8px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td colspan="2" style="padding: 8px;"><strong>Total</strong></td>
                <td style="padding: 8px;"><strong>$${order.total_amount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <p>If you have any questions, please contact us at support@afrojerk.com</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>Afro Jerk Food Truck</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Email sent successfully:', {
      id: data?.id,
      to: order.customer_email
    });

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error processing order email:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to send confirmation email',
        details: error.message 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});