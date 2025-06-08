const axios = require('axios');

async function testWithTimeout() {
  console.log('🧪 Testing customer creation with timeout...');
  
  try {
    // Create user first
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'password123',
      phone: '1234567890',
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };

    console.log('📤 Creating user...');
    const userResponse = await axios.post('http://localhost:1310/users', userData);
    
    if (userResponse.data.EC !== 0) {
      console.error('❌ User creation failed:', userResponse.data.EM);
      return;
    }

    const createdUser = userResponse.data.data;
    console.log('✅ User created:', createdUser.id);

    // Create customer
    const customerData = {
      user_id: createdUser.id,
      first_name: 'Test',
      last_name: 'User'
    };

    console.log('📤 Creating customer...');
    
    // Set a timeout for the customer creation
    const customerPromise = axios.post('http://localhost:1310/customers', customerData);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Customer creation timeout after 5 seconds')), 5000);
    });

    const customerResponse = await Promise.race([customerPromise, timeoutPromise]);
    
    if (customerResponse.data.EC === 0) {
      console.log('✅ Customer created successfully!');
      console.log('Customer data:', JSON.stringify(customerResponse.data.data, null, 2));
    } else {
      console.error('❌ Customer creation failed:', customerResponse.data.EM);
      console.error('Response data:', JSON.stringify(customerResponse.data, null, 2));
    }

  } catch (error) {
    if (error.message.includes('timeout')) {
      console.error('🕐 Customer creation timed out - this suggests a database constraint issue');
    } else {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

testWithTimeout(); 