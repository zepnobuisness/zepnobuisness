import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify Razorpay webhook signature
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      throw new Error('Missing Razorpay signature');
    }

    const body = await req.json();

    // Handle different webhook events
    switch (body.event) {
      case 'payment.captured':
        const paymentData = body.payload.payment.entity;
        const userId = paymentData.notes.user_id;
        const amount = paymentData.amount / 100; // Convert from paise to rupees

        // Update user's wallet balance
        const { error: updateError } = await supabaseClient.rpc('add_funds', {
          p_user_id: userId,
          p_amount: amount
        });

        if (updateError) {
          throw updateError;
        }

        // Create transaction record
        const { error: transactionError } = await supabaseClient
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'credit',
            amount: amount,
            purpose: 'Wallet top-up',
            payment_id: paymentData.id
          });

        if (transactionError) {
          throw transactionError;
        }

        break;

      // Add more cases for other webhook events if needed
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});