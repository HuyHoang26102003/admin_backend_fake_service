const axios = require('axios');

async function testSimpleCustomer() {
  try {
    console.log('🔍 Testing simple customer creation...');
    
    // First check if backend is responsive
    const healthResponse = await axios.get('http://localhost:1310/users');
    console.log('✅ Backend is responsive');
    
    // Create user
    const userData = {
      first_name: 'Simple',
      last_name: 'Test',
      email: `simple.test.${Date.now()}@example.com`,
      password: 'password123',
      user_type: ['CUSTOMER']
    };

    const userResponse = await axios.post('http://localhost:1310/users', userData);
    if (userResponse.data.EC !== 0) {
      console.error('❌ User creation failed:', userResponse.data.EM);
      return;
    }
    
    const userId = userResponse.data.data.id;
    console.log('✅ User created:', userId);

    // Try customer creation with minimal data
    console.log('📤 Attempting customer creation...');
    
    try {
      const response = await axios.post('http://localhost:1310/customers', {
        user_id: userId,
        first_name: 'Simple',
        last_name: 'Test'
      }, {
        timeout: 3000  // 3 second timeout
      });
      
      console.log('✅ Customer created successfully!');
      console.log('Response:', response.data);
      
    } catch (customerError) {
      if (customerError.code === 'ECONNABORTED') {
        console.error('🕐 Customer creation timed out - database constraint issue');
        console.error('💡 Suggestions:');
        console.error('   1. Restart your main backend after entity changes');
        console.error('   2. Check if database migrations are needed');
        console.error('   3. Verify the BeforeInsert hook was applied correctly');
      } else {
        console.error('❌ Customer creation error:', customerError.response?.data || customerError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleCustomer(); 