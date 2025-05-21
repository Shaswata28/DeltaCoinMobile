/*
  # Add PIN column to users table

  1. Changes
    - Add PIN column to users table for transaction security
    - PIN is stored as text to preserve leading zeros
    - PIN is required for all users
    - Add check constraint to ensure PIN is exactly 5 digits
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'pin'
  ) THEN
    ALTER TABLE users ADD COLUMN pin text NOT NULL;
    ALTER TABLE users ADD CONSTRAINT users_pin_check CHECK (pin ~ '^[0-9]{5}$');
  END IF;
END $$;