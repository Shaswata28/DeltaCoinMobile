/*
  # Update auth schema for username login

  1. Changes
    - Add unique username constraint to auth.users
    - Update user creation trigger
    - Update RLS policies
*/

-- Add username field to auth.users metadata
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users(username);

-- Update handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    username,
    full_name,
    student_id,
    contact_number
  )
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'username')::text,
    (NEW.raw_user_meta_data->>'full_name')::text,
    (NEW.raw_user_meta_data->>'student_id')::text,
    (NEW.raw_user_meta_data->>'contact_number')::text
  );
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;