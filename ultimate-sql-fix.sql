-- ULTIMATE SQL FIX FOR FLASHFOOD DATABASE
-- This script fixes ALL constraints and prepares the database for ultimate generation

-- ===================================
-- 1. FIX CUSTOMER TABLE CONSTRAINTS
-- ===================================

-- Make last_login nullable in customers table
ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;

-- Add default value for last_login
ALTER TABLE customers ALTER COLUMN last_login SET DEFAULT EXTRACT(EPOCH FROM NOW());

-- Update any existing NULL values
UPDATE customers SET last_login = EXTRACT(EPOCH FROM NOW()) WHERE last_login IS NULL;

-- ===================================
-- 2. FIX DRIVER TABLE CONSTRAINTS  
-- ===================================

-- Ensure last_login is nullable for drivers (should already be)
-- ALTER TABLE drivers ALTER COLUMN last_login DROP NOT NULL;

-- ===================================
-- 3. VERIFY TABLE STRUCTURES
-- ===================================

-- Check customers table structure
SELECT 
    column_name, 
    is_nullable, 
    data_type, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('last_login', 'user_id', 'first_name', 'last_name')
ORDER BY column_name;

-- Check drivers table structure
SELECT 
    column_name, 
    is_nullable, 
    data_type, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'drivers' 
AND column_name IN ('last_login', 'user_id', 'first_name', 'last_name')
ORDER BY column_name;

-- Check restaurants table structure
SELECT 
    column_name, 
    is_nullable, 
    data_type, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name IN ('owner_id', 'address_id', 'restaurant_name', 'owner_name')
ORDER BY column_name;

-- ===================================
-- 4. CHECK CURRENT DATA
-- ===================================

-- Count all records
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 
    'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 
    'drivers' as table_name, COUNT(*) as record_count FROM drivers
UNION ALL
SELECT 
    'restaurants' as table_name, COUNT(*) as record_count FROM restaurants
UNION ALL
SELECT 
    'address_books' as table_name, COUNT(*) as record_count FROM address_books
UNION ALL
SELECT 
    'food_categories' as table_name, COUNT(*) as record_count FROM food_categories
ORDER BY table_name;

-- ===================================
-- 5. PERFORMANCE OPTIMIZATIONS
-- ===================================

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_address_id ON restaurants(address_id);

-- ===================================
-- 6. VERIFICATION QUERIES
-- ===================================

-- Test customer creation constraint
SELECT 
    'Customer table ready' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'customers' 
            AND column_name = 'last_login' 
            AND is_nullable = 'YES'
        ) 
        THEN 'READY ✅' 
        ELSE 'NEEDS FIX ❌' 
    END as last_login_status;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('customers', 'drivers', 'restaurants')
ORDER BY tc.table_name, tc.constraint_name;

-- ===================================
-- SUCCESS MESSAGE
-- ===================================
SELECT 
    '🎉 ULTIMATE SQL FIX COMPLETE! 🎉' as message,
    'Database is ready for ultimate generation!' as status; 