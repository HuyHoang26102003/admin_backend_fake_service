const axios = require('axios');
const { faker } = require('@faker-js/faker');

async function createValidCustomer() {
  console.log('🚀 Creating Valid Customer Test');
  console.log('=' .repeat(50));
  
  try {
    // Create a user first
    console.log('👤 Creating customer user...');
    const userData = {
      first_name: 'Valid',
      last_name: 'Customer',
      email: `valid.customer.${Date.now()}@example.com`,
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
    
    // Create valid customer per DTO requirements
    console.log('\n👥 Creating customer with VALID DTO...');
    const customerData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      address: user.address,
      // Optional fields as specified in DTO
      preferred_category_ids: [],
      favorite_restaurant_ids: [],
      favorite_items: [],
      support_tickets: [],
      app_preferences: {
        theme: "LIGHT"
      },
      restaurant_history: [],
      // Optional timestamps
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };
    
    console.log('📤 Customer data:', JSON.stringify(customerData, null, 2));
    
    try {
      const start = Date.now();
      const customerResponse = await axios.post('http://localhost:1310/customers', customerData, {
        timeout: 8000
      });
      const end = Date.now();
      
      if (customerResponse.data.EC === 0) {
        const customer = customerResponse.data.data;
        console.log(`✅ SUCCESS! Customer created in ${end - start}ms`);
        console.log(`   ID: ${customer.id}`);
        console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
        
        // Check tables
        await checkTables();
        
        return true;
      } else {
        console.log(`❌ Customer creation failed: ${customerResponse.data.EM}`);
        if (customerResponse.data.DT) {
          console.log('📋 Validation errors:', JSON.stringify(customerResponse.data.DT, null, 2));
        }
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Customer creation timed out - SQL fix needed');
        console.log('🚨 Please run this command in NeonDB:');
        console.log('   ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;');
      } else if (error.response) {
        console.log(`❌ Error: ${error.response.status} - ${error.response.data?.EM || 'Unknown error'}`);
        if (error.response.data?.DT) {
          console.log('📋 Details:', JSON.stringify(error.response.data.DT, null, 2));
        }
      } else {
        console.log(`❌ Network error: ${error.message}`);
      }
    }
    
    // Try absolute minimal data
    console.log('\n🔄 Trying absolute minimal data...');
    try {
      const minimalData = {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name
      };
      
      console.log('📤 Minimal data:', JSON.stringify(minimalData, null, 2));
      
      const minResponse = await axios.post('http://localhost:1310/customers', minimalData, {
        timeout: 8000
      });
      
      if (minResponse.data.EC === 0) {
        const customer = minResponse.data.data;
        console.log(`✅ SUCCESS with minimal data!`);
        console.log(`   ID: ${customer.id}`);
        
        await checkTables();
        
        return true;
      } else {
        console.log(`❌ Minimal data failed: ${minResponse.data.EM}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Minimal data timed out - SQL fix needed');
      } else {
        console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
      }
    }
    
    // Try one with explicitly set last_login
    console.log('\n🔄 Trying with explicit last_login...');
    try {
      const explicitData = {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        last_login: Math.floor(Date.now() / 1000)
      };
      
      console.log('📤 With last_login:', JSON.stringify(explicitData, null, 2));
      
      const explicitResponse = await axios.post('http://localhost:1310/customers', explicitData, {
        timeout: 8000
      });
      
      if (explicitResponse.data.EC === 0) {
        const customer = explicitResponse.data.data;
        console.log(`✅ SUCCESS with explicit last_login!`);
        console.log(`   ID: ${customer.id}`);
        
        await checkTables();
        
        return true;
      } else {
        console.log(`❌ Explicit last_login failed: ${explicitResponse.data.EM}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Explicit last_login timed out');
        console.log('🔥 The SQL fix is DEFINITELY needed');
      } else {
        console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
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
createValidCustomer(); 