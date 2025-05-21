/*
  # Clear all existing data
  
  This migration safely removes all existing data while preserving table structures and policies.
  
  1. Changes
    - Removes all data from users, wallets, transactions, and budgets tables
    - Preserves table structures and policies
    - Maintains referential integrity by deleting in correct order
*/

-- Disable triggers temporarily to avoid side effects
ALTER TABLE users DISABLE TRIGGER ALL;
ALTER TABLE wallets DISABLE TRIGGER ALL;
ALTER TABLE transactions DISABLE TRIGGER ALL;
ALTER TABLE budgets DISABLE TRIGGER ALL;

-- Delete data in correct order (respecting foreign key constraints)
DELETE FROM budgets;
DELETE FROM transactions;
DELETE FROM wallets;
DELETE FROM users;

-- Re-enable triggers
ALTER TABLE budgets ENABLE TRIGGER ALL;
ALTER TABLE transactions ENABLE TRIGGER ALL;
ALTER TABLE wallets ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;