const axios = require('axios');

async function finalTest() {
  console.log('🚀 FINAL CUSTOMER CREATION TEST');
  console.log('=' .repeat(50));
  
  try {
    // Get all existing users
    const usersResponse = await axios.get('http://localhost:1310/users');
    const users = usersResponse.data.data || [];
    
    if (users.length === 0) {
      console.log('❌ No users found to create a customer with');
      return;
    }
    
    console.log(`✅ Found ${users.length} existing users`);
    
    // Create a fresh user
    console.log('\n👤 Creating a fresh user for testing...');
    const userData = {
      first_name: 'Final',
      last_name: 'Test',
      email: `final.test.${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210',
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
    console.log(`✅ Created user: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    
    // Attempt to create a customer with the explicit last_login field
    console.log('\n👥 Creating customer with explicit last_login field...');
    const now = Math.floor(Date.now() / 1000);
    const customerData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      last_login: now
    };
    
    console.log('📤 Sending customer data:', JSON.stringify(customerData, null, 2));
    
    try {
      console.log('⏳ Sending request...');
      
      // Set a longer timeout to see if it's just a slow request
      const customerResponse = await axios.post('http://localhost:1310/customers', customerData, {
        timeout: 15000 // 15 seconds
      });
      
      if (customerResponse.data.EC === 0) {
        const customer = customerResponse.data.data;
        console.log(`\n✅ SUCCESS! Customer created!`);
        console.log(`   ID: ${customer.id}`);
        console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
        console.log(`   Last Login: ${customer.last_login}`);
        console.log('\n🎉 The SQL fix has been applied successfully!');
        
        await checkAllTables();
        return true;
      } else {
        console.log(`\n❌ Customer creation failed: ${customerResponse.data.EM}`);
        console.log('Error details:', JSON.stringify(customerResponse.data.DT || {}, null, 2));
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('\n⏱️ Customer creation timed out after 15 seconds');
        console.log('🚨 This strongly indicates the SQL fix is needed but has not been applied');
      } else if (error.response) {
        console.log(`\n❌ Error ${error.response.status}: ${error.response.data.EM || 'Unknown error'}`);
        console.log('Error details:', JSON.stringify(error.response.data.DT || {}, null, 2));
      } else {
        console.log(`\n❌ Error: ${error.message}`);
      }
    }
    
    // If we get here, customer creation failed
    console.log('\n📝 CONCLUSION:');
    console.log('1. The customer creation is still failing');
    console.log('2. The SQL fix needs to be applied to your NeonDB database');
    console.log('3. Please ensure you run the following SQL command in the NeonDB console:');
    console.log('   ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;');
    console.log('4. After applying the fix, customers will be created successfully');
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function checkAllTables() {
  console.log('\n📊 Current Table Status:');
  console.log('=' .repeat(50));
  
  const tables = [
    { name: 'Users', endpoint: 'users' },
    { name: 'Customers', endpoint: 'customers' },
    { name: 'Drivers', endpoint: 'drivers' },
    { name: 'Restaurants', endpoint: 'restaurants' },
    { name: 'Address Books', endpoint: 'address_books' }
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
finalTest(); 