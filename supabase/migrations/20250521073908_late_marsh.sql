/*
  # Add Insert Policy for Users Table

  1. Changes
    - Add policy to allow inserting new users during signup
    - This policy is required to allow the creation of new user records
*/

-- Add policy for inserting new users
CREATE POLICY "Enable insert for authenticated users only"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);