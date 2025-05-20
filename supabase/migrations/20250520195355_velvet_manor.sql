/*
  # Initial Database Schema

  1. New Tables
    - users
      - id (uuid, primary key)
      - username (text, unique)
      - full_name (text)
      - student_id (text, unique)
      - contact_number (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - wallets
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - balance (decimal)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - transactions
      - id (uuid, primary key)
      - wallet_id (uuid, foreign key)
      - type (text) - 'send' or 'receive'
      - amount (decimal)
      - recipient (text)
      - category (text)
      - status (text) - 'completed', 'pending', 'failed'
      - created_at (timestamp)
    
    - categories
      - id (uuid, primary key)
      - name (text)
      - icon (text)
      - color (text)
      - created_at (timestamp)
    
    - budgets
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - category_id (uuid, foreign key)
      - amount (decimal)
      - period (text) - 'monthly', 'weekly'
      - notifications (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  contact_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wallets table
CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  balance decimal NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('send', 'receive')),
  amount decimal NOT NULL CHECK (amount > 0),
  recipient text NOT NULL,
  category text NOT NULL,
  status text NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Budgets table
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  amount decimal NOT NULL CHECK (amount > 0),
  period text NOT NULL CHECK (period IN ('monthly', 'weekly')),
  notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Users can view own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);

-- Insert default categories
INSERT INTO categories (name, icon, color) VALUES
  ('Canteen', 'Coffee', '#FFD700'),
  ('Library', 'Book', '#4D9FFF'),
  ('Laboratory', 'Beaker', '#FF6B6B'),
  ('Clubs', 'Users', '#10B981'),
  ('Other', 'MoreHorizontal', '#A78BFA');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();