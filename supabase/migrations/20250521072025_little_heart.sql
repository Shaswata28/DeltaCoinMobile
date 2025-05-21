/*
  # Update user policies and triggers

  1. Security
    - Enable RLS on users table
    - Add policies for user data access
    - Create trigger for wallet creation
    - Create trigger for user metadata updates

  2. Changes
    - Add trigger functions for handling new users and metadata
    - Add policies for user data access control
*/

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create auth trigger function if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    CREATE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.wallets (user_id, balance)
      VALUES (NEW.id, 0);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END $$;

-- Create trigger for new user creation if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Policies for users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data') THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data') THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Function to handle user metadata if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_user_metadata') THEN
    CREATE FUNCTION public.handle_user_metadata()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE auth.users
      SET raw_user_meta_data = jsonb_build_object(
        'full_name', NEW.full_name,
        'student_id', NEW.student_id,
        'contact_number', NEW.contact_number
      )
      WHERE id = NEW.id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END $$;

-- Trigger for user metadata updates if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_user_updated') THEN
    CREATE TRIGGER on_user_updated
      AFTER UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_user_metadata();
  END IF;
END $$;