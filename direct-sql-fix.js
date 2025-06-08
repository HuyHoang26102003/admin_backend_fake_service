const { Client } = require('pg');

async function applyDirectSQLFix() {
  console.log('🚀 Direct SQL Fix for Customer Table');
  console.log('=' .repeat(50));
  
  // Create a client with NeonDB connection details from app.module.ts
  const dbConfig = {
    host: process.env.NEON_HOST || 'ep-soft-mode-a5fjsjwt.us-east-2.aws.neon.tech',
    port: parseInt(process.env.NEON_PORT || '5432', 10),
    user: process.env.NEON_USER || 'flashfood_owner',
    password: process.env.NEON_PASSWORD || 'flashfood_pass',
    database: process.env.NEON_DATABASE || 'flashstrom',
    ssl: {
      rejectUnauthorized: false
    }
  };
  
  // Connect to the database
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to database...');
    console.log(`📊 Using connection details:
    - Host: ${dbConfig.host}
    - Port: ${dbConfig.port}
    - User: ${dbConfig.user}
    - Database: ${dbConfig.database}
    - SSL: Enabled`);
    
    await client.connect();
    console.log('✅ Connected to database!');
    
    // First check if the fix is already applied
    console.log('\n🔍 Checking if the fix is already applied...');
    const checkQuery = `
      SELECT column_name, is_nullable, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'last_login';
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Could not find last_login column in customers table');
      return;
    }
    
    const lastLoginColumn = checkResult.rows[0];
    console.log('📋 Current last_login column:');
    console.log(lastLoginColumn);
    
    if (lastLoginColumn.is_nullable === 'YES') {
      console.log('\n✅ The SQL fix is already applied! last_login is already nullable.');
      
      // Check if there are any customers
      const customerCountResult = await client.query('SELECT COUNT(*) FROM customers;');
      const customerCount = parseInt(customerCountResult.rows[0].count);
      
      console.log(`📊 Current customer count: ${customerCount}`);
      
      if (customerCount === 0) {
        console.log('\n🤔 Strange: SQL fix is applied but no customers exist.');
        console.log('   Possible issues:');
        console.log('   1. The backend might be connecting to a different database');
        console.log('   2. Customer creation has validation errors not related to last_login');
        console.log('   3. The data generator is not working correctly');
      }
    } else {
      console.log('\n🔧 Applying SQL fix...');
      const alterQuery = `ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;`;
      
      await client.query(alterQuery);
      console.log('✅ SQL fix applied successfully!');
      
      // Verify the fix
      const verifyResult = await client.query(checkQuery);
      const updatedLastLoginColumn = verifyResult.rows[0];
      
      console.log('\n📋 Updated last_login column:');
      console.log(updatedLastLoginColumn);
      
      if (updatedLastLoginColumn.is_nullable === 'YES') {
        console.log('\n🎉 SUCCESS! The fix was applied correctly.');
      } else {
        console.log('\n❌ The fix was NOT applied correctly.');
      }
    }
    
    // Perform all additional checks from the ultimate-sql-fix.sql
    console.log('\n📊 Checking all tables:');
    const tableCountQuery = `
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
    `;
    
    const tableCountResult = await client.query(tableCountQuery);
    
    console.log('=' .repeat(50));
    console.log('📊 Current Record Counts:');
    console.log('=' .repeat(50));
    
    tableCountResult.rows.forEach(row => {
      console.log(`${row.table_name}: ${row.record_count} records`);
    });
    
  } catch (error) {
    console.log('❌ Database error:', error.message);
    if (error.stack) {
      console.log(error.stack);
    }
  } finally {
    // Close the connection
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
applyDirectSQLFix(); 