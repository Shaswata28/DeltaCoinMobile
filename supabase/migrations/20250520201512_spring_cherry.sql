/*
  # Authentication Setup

  1. Security Policies
    - Enable RLS on users table
    - Add policies for user management
    - Set up auth triggers

  2. Changes
    - Add auth schema triggers
    - Update users table security
*/

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create auth trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to handle user metadata
CREATE OR REPLACE FUNCTION public.handle_user_metadata()
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

-- Trigger for user metadata updates
CREATE TRIGGER on_user_updated
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_metadata();