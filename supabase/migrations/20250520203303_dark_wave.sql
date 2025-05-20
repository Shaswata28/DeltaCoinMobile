/*
  # Add username authentication support
  
  1. Changes
    - Add unique constraint on username
    - Update user creation trigger
    - Add RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Ensure username is unique in public.users table
ALTER TABLE public.users 
ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Update or create the handle_new_user function
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
    NEW.raw_user_meta_data->>'username',
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

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for users table
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