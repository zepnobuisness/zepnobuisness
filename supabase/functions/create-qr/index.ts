import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Razorpay from 'npm:razorpay@2.9.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, userId } = await req.json();

    if (!amount || !userId) {
      throw new Error('Amount and userId are required');
    }

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID'),
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET'),
    });

    // Create a QR code
    const qr = await razorpay.qrCode.create({
      type: 'upi_qr',
      name: 'Zepno Wallet',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: amount,
      description: 'Add funds to Zepno wallet',
      customer_id: userId,
      close_by: Math.floor(Date.now() / 1000) + 3600, // QR valid for 1 hour
      notes: {
        userId,
        purpose: 'wallet_topup',
      },
    });

    return new Response(
      JSON.stringify({
        qr_code: qr.image_url,
        payment_id: qr.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});