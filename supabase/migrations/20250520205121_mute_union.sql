/*
  # Authentication Setup

  1. Changes
    - Add email field to users table
    - Add auth triggers and policies
    - Add constraints for unique fields

  2. Security
    - Enable RLS on users table
    - Add policies for user data access
    - Add secure trigger functions
*/

-- Add email field to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email text;

-- Add unique constraint for email
ALTER TABLE public.users
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Update handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    username,
    email,
    full_name,
    student_id,
    contact_number
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'contact_number'
  );
  
  -- Create wallet for new user
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_user_metadata function
CREATE OR REPLACE FUNCTION public.handle_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', NEW.username,
    'full_name', NEW.full_name,
    'student_id', NEW.student_id,
    'contact_number', NEW.contact_number
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);