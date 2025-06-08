-- 🚨 CRITICAL FIX FOR CUSTOMER TABLE 🚨
-- Copy and paste this EXACT command into your NeonDB SQL console

ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;

-- Verify the fix worked
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'last_login';

-- This should show: is_nullable = 'YES' 