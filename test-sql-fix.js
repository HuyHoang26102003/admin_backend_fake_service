const axios = require('axios');
const { faker } = require('@faker-js/faker');

async function testSQLFix() {
  console.log('🚀 Testing if SQL Fix Has Been Applied');
  console.log('=' .repeat(50));
  
  try {
    // 1. Create a user
    console.log('👤 Creating test user...');
    const userData = {
      first_name: 'SQL',
      last_name: 'Test',
      email: `sql.test.${Date.now()}@example.com`,
      password: 'password123',
      phone: '1234567890',
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };
    
    const userResponse = await axios.post('http://localhost:1310/users', userData);
    if (userResponse.data.EC !== 0) {
      console.log('❌ User creation failed:', userResponse.data.EM);
      return;
    }
    
    const user = userResponse.data.data;
    console.log(`✅ User created: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    
    // 2. Try to create a customer WITHOUT last_login
    console.log('\n🧪 Testing customer creation WITHOUT last_login...');
    const customerData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name
    };
    
    console.log('📤 Customer data:', JSON.stringify(customerData, null, 2));
    
    try {
      console.log('⏳ Sending request - this should be quick if SQL fix is applied');
      console.log('   or timeout if the fix is NOT applied...');
      
      const start = Date.now();
      const customerResponse = await axios.post('http://localhost:1310/customers', customerData, {
        timeout: 10000 // 10 second timeout
      });
      const end = Date.now();
      const time = end - start;
      
      if (customerResponse.data.EC === 0) {
        const customer = customerResponse.data.data;
        console.log(`\n✅ CUSTOMER CREATED SUCCESSFULLY in ${time}ms!`);
        console.log(`   ID: ${customer.id}`);
        console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
        console.log('\n🎉 SUCCESS! The SQL fix has been applied!');
        console.log('   ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;');
        
        // Print last_login value for verification
        if (customer.last_login === null) {
          console.log('\n✅ Confirmed: last_login is NULL in the database');
        } else {
          console.log(`\n⚠️ Note: last_login is set to: ${customer.last_login}`);
          console.log('   This is fine as long as customer creation works');
        }
        
        await checkTables();
        return true;
      } else {
        console.log(`\n❌ Customer creation failed: ${customerResponse.data.EM}`);
        if (customerResponse.data.DT) {
          console.log('📋 Details:', JSON.stringify(customerResponse.data.DT, null, 2));
        }
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('\n❌ TIMEOUT - SQL FIX NOT APPLIED!');
        console.log('🚨 You need to run this SQL command in NeonDB:');
        console.log('   ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;');
      } else if (error.response) {
        console.log(`\n❌ Error: ${error.response.status} - ${error.response.data?.EM || 'Unknown error'}`);
        if (error.response.data?.DT) {
          console.log('📋 Details:', JSON.stringify(error.response.data.DT, null, 2));
        }
      } else {
        console.log(`\n❌ Network error: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  return false;
}

async function checkTables() {
  console.log('\n📊 Database Status:');
  console.log('=' .repeat(50));
  
  const tables = [
    { name: 'Users', endpoint: 'users' },
    { name: 'Customers', endpoint: 'customers' },
    { name: 'Drivers', endpoint: 'drivers' },
    { name: 'Restaurants', endpoint: 'restaurants' }
  ];

  for (const table of tables) {
    try {
      const response = await axios.get(`http://localhost:1310/${table.endpoint}`);
      const count = response.data.data?.length || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${table.name}: ${count} records`);
    } catch (error) {
      console.log(`❌ ${table.name}: Error checking`);
    }
  }
}

// Run the test
testSQLFix(); 