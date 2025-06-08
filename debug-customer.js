const axios = require('axios');
const { faker } = require('@faker-js/faker');

async function debugCustomerCreation() {
  console.log('🔍 Debugging customer creation...');
  
  try {
    // Test with absolute minimal customer data
    const firstName = 'John';
    const lastName = 'Doe';
    const email = `john.doe.${Date.now()}@test.com`;

    // Step 1: Create user
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: 'password123',
      phone: '1234567890',
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };

    console.log('📤 Creating user...');
    const userResponse = await axios.post('http://localhost:1310/users', userData);
    
    if (userResponse.data.EC !== 0) {
      console.error('❌ Failed to create user:', userResponse.data.EM);
      return;
    }

    const createdUser = userResponse.data.data;
    console.log('✅ User created:', createdUser.id);

    // Step 2: Try customer creation without last_login to see other validation errors
    const customerData = {
      user_id: createdUser.id,
      first_name: firstName,
      last_name: lastName
    };

    console.log('📤 Creating customer...');
    
    try {
      const customerResponse = await axios.post('http://localhost:1310/customers', customerData);
      
      if (customerResponse.data.EC === 0) {
        console.log('✅ Customer created successfully!');
        console.log('Customer data:', JSON.stringify(customerResponse.data.data, null, 2));
      } else {
        console.error('❌ Failed to create customer:', customerResponse.data.EM);
        console.error('Full response:', JSON.stringify(customerResponse.data, null, 2));
      }
    } catch (customerError) {
      console.error('❌ Customer creation error:', customerError.message);
      if (customerError.response) {
        console.error('Response status:', customerError.response.status);
        console.error('Response data:', JSON.stringify(customerError.response.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response && error.response.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugCustomerCreation(); 