/*
  # Add payment-related fields to transactions table

  1. Changes
    - Add payment_id column to transactions table for tracking Razorpay payments
    - Add function for safely adding funds to user wallet

  2. Security
    - Function is accessible only to authenticated users
*/

-- Add payment_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_id text;

-- Create function to safely add funds to user wallet
CREATE OR REPLACE FUNCTION add_funds(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user balance
  UPDATE users 
  SET balance = balance + p_amount
  WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_funds TO authenticated;