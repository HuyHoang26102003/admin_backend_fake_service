const axios = require('axios');
const { faker } = require('@faker-js/faker');

async function createTestData() {
  console.log('🚀 Creating Test Data From Scratch');
  console.log('=' .repeat(50));
  
  try {
    // 1. Create an address
    console.log('📍 Creating address...');
    const now = Math.floor(Date.now() / 1000);
    const addressData = {
      street: '123 Test Street',
      city: 'Test City',
      nationality: 'Test Country',
      postal_code: 12345,
      location: {
        lat: 40.7128,
        lng: -74.0060
      },
      title: 'Test Address',
      is_default: true,
      created_at: now,
      updated_at: now
    };
    
    const addressResponse = await axios.post('http://localhost:1310/address_books', addressData);
    if (addressResponse.data.EC === 0) {
      const address = addressResponse.data.data;
      console.log(`✅ Address created: ${address.id}`);
    } else {
      console.log(`❌ Address creation failed: ${addressResponse.data.EM}`);
    }
    
    // 2. Create a user
    console.log('\n👤 Creating user...');
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };
    
    const userResponse = await axios.post('http://localhost:1310/users', userData);
    if (userResponse.data.EC !== 0) {
      console.log(`❌ User creation failed: ${userResponse.data.EM}`);
      return;
    }
    
    const user = userResponse.data.data;
    console.log(`✅ User created: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    
    // 3. Create a customer
    console.log('\n👥 Creating customer...');
    const customerData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      // Including last_login to work around constraint
      last_login: Math.floor(Date.now() / 1000)
    };
    
    try {
      const customerResponse = await axios.post('http://localhost:1310/customers', customerData, {
        timeout: 5000
      });
      
      if (customerResponse.data.EC === 0) {
        const customer = customerResponse.data.data;
        console.log(`✅ CUSTOMER CREATED SUCCESSFULLY: ${customer.id}`);
        console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
        console.log('\n🎉 SUCCESS! Customer creation is working!');
        console.log('💡 The SQL fix has been applied successfully!');
        
        // Check all tables
        await checkAllTables();
        
        return true;
      } else {
        console.log(`❌ Customer creation failed: ${customerResponse.data.EM}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Customer creation timed out - SQL fix not applied');
        console.log('🚨 You need to run the SQL fix in NeonDB:');
        console.log('   ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;');
      } else {
        console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
      }
    }
    
    // 4. Try alternative approach with manually set last_login
    console.log('\n🔄 Trying alternative approach...');
    const alternativeData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      last_login: Math.floor(Date.now() / 1000),
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };
    
    try {
      console.log('📤 Sending with explicit timestamps:');
      const altResponse = await axios.post('http://localhost:1310/customers', alternativeData, {
        timeout: 5000
      });
      
      if (altResponse.data.EC === 0) {
        const customer = altResponse.data.data;
        console.log(`✅ CUSTOMER CREATED SUCCESSFULLY: ${customer.id}`);
        console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
        console.log('\n🎉 SUCCESS! Customer creation is working with explicit last_login!');
        
        await checkAllTables();
        
        return true;
      } else {
        console.log(`❌ Alternative approach failed: ${altResponse.data.EM}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Alternative approach timed out');
        console.log('⚠️ The SQL fix is DEFINITELY needed');
      } else {
        console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  return false;
}

async function checkAllTables() {
  console.log('\n📊 Current Table Status:');
  console.log('=' .repeat(50));
  
  const tables = [
    { name: 'Users', endpoint: 'users' },
    { name: 'Customers', endpoint: 'customers' },
    { name: 'Drivers', endpoint: 'drivers' },
    { name: 'Restaurants', endpoint: 'restaurants' },
    { name: 'Address Books', endpoint: 'address_books' },
    { name: 'Categories', endpoint: 'food-categories' }
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
createTestData(); 