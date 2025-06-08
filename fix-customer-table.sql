-- Fix Customer Table - Make last_login nullable
-- This will solve the customer creation timeout issue

-- Option 1: Make last_login nullable (RECOMMENDED)
ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;

-- Option 2: Set a default value for last_login (Alternative)
-- ALTER TABLE customers ALTER COLUMN last_login SET DEFAULT EXTRACT(EPOCH FROM NOW());

-- Option 3: Add default value to existing NULL records (if any exist)
-- UPDATE customers SET last_login = EXTRACT(EPOCH FROM NOW()) WHERE last_login IS NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'last_login';

-- Test query to check if customers table is ready
SELECT COUNT(*) as customer_count FROM customers; 