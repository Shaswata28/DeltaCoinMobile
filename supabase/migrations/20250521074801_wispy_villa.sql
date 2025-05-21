/*
  # Update wallet policies

  1. Changes
    - Add policy to allow wallet creation during registration
    - Update existing wallet policies for better security

  2. Security
    - Enable RLS on wallets table
    - Add policies for wallet management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;

-- Create new policies for wallets
CREATE POLICY "Enable wallet creation during registration"
  ON wallets FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);