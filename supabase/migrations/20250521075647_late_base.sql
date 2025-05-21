/*
  # Clear Database Data
  
  This migration safely removes all data from the database while maintaining referential integrity.
  
  1. Deletions
    - Removes all data from tables in the correct order to respect foreign key constraints
    
  2. Notes
    - Maintains table structure and policies
    - Safe to run multiple times
*/

-- Delete data in correct order (respecting foreign key constraints)
DELETE FROM budgets WHERE true;
DELETE FROM transactions WHERE true;
DELETE FROM wallets WHERE true;
DELETE FROM users WHERE true;