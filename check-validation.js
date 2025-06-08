const axios = require('axios');

async function checkValidation() {
  console.log('🔍 Checking Validation Errors');
  console.log('=' .repeat(50));
  
  try {
    // Pick an existing user
    const usersResponse = await axios.get('http://localhost:1310/users');
    const users = usersResponse.data.data;
    
    if (users.length === 0) {
      console.log('❌ No users found to create a customer with');
      return;
    }
    
    const user = users[0]; // Use the first user
    console.log(`👤 Using existing user: ${user.first_name} ${user.last_name} (${user.id})`);
    
    // Create a customer with explicit last_login
    const customerData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      last_login: Math.floor(Date.now() / 1000)
    };
    
    console.log('📤 Sending customer data:');
    console.log(JSON.stringify(customerData, null, 2));
    
    try {
      const customerResponse = await axios.post('http://localhost:1310/customers', customerData);
      
      if (customerResponse.data.EC === 0) {
        const customer = customerResponse.data.data;
        console.log(`✅ SUCCESS! Customer created!`);
        console.log(`   ID: ${customer.id}`);
        return true;
      } else {
        console.log(`❌ Customer creation failed: ${customerResponse.data.EM}`);
        console.log('📋 Validation errors:');
        console.log(JSON.stringify(customerResponse.data.DT, null, 2));
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.log(`❌ Error ${error.response.status}: ${error.response.data.EM || 'Unknown error'}`);
        console.log('📋 Details:');
        console.log(JSON.stringify(error.response.data, null, 2));
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    // Try to see the DTO constraints
    console.log('\n📑 Checking DTO validation requirements...');
    
    try {
      // Send a minimal object to see what fields are required
      const minimalData = { user_id: 'test' };
      await axios.post('http://localhost:1310/customers', minimalData);
    } catch (error) {
      if (error.response && error.response.data) {
        console.log('🔎 Required fields according to validation:');
        console.log(JSON.stringify(error.response.data.DT, null, 2));
      }
    }
    
    // Check if any customers exist in the database
    console.log('\n🧐 Checking if any customers exist in the database...');
    try {
      const customersResponse = await axios.get('http://localhost:1310/customers');
      const customers = customersResponse.data.data || [];
      
      if (customers.length > 0) {
        console.log(`✅ Found ${customers.length} existing customers`);
        console.log('📋 First customer:');
        console.log(JSON.stringify(customers[0], null, 2));
      } else {
        console.log('❌ No customers found in the database');
      }
    } catch (error) {
      console.log(`❌ Error checking customers: ${error.message}`);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

checkValidation(); 