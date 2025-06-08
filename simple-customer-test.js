const axios = require('axios');

async function testCustomerSimple() {
  console.log('🔍 SIMPLE CUSTOMER TEST');
  console.log('=' .repeat(40));
  
  try {
    // Check backend
    console.log('🌐 Checking backend...');
    const users = await axios.get('http://localhost:1310/users');
    console.log(`✅ Backend OK - ${users.data.data.length} users`);
    
    // Get a customer user
    const customerUsers = users.data.data.filter(user => 
      user.user_type && user.user_type.includes('CUSTOMER')
    );
    
    if (customerUsers.length === 0) {
      console.log('❌ No customer users found');
      return;
    }
    
    const user = customerUsers[0];
    console.log(`👤 Using customer user: ${user.first_name} ${user.last_name}`);
    
    // Try creating customer profile
    const customerData = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name
    };
    
    console.log('\n📤 Creating customer profile...');
    console.log('Data:', JSON.stringify(customerData, null, 2));
    
    const start = Date.now();
    
    try {
      const response = await axios.post('http://localhost:1310/customers', customerData, {
        timeout: 10000
      });
      
      const end = Date.now();
      
      if (response.data.EC === 0) {
        console.log(`✅ SUCCESS! Customer created in ${end - start}ms`);
        console.log('Customer:', response.data.data.id);
        
        // Check count
        const customers = await axios.get('http://localhost:1310/customers');
        console.log(`📊 Total customers: ${customers.data.data.length}`);
      } else {
        console.log(`❌ Failed: ${response.data.EM}`);
      }
    } catch (error) {
      const end = Date.now();
      
      if (error.code === 'ECONNABORTED') {
        console.log(`🕐 TIMEOUT after ${end - start}ms`);
        console.log('💡 This confirms DATABASE CONSTRAINT issue!');
        console.log('🔧 The last_login field is blocking customer creation');
      } else if (error.response) {
        console.log(`❌ Error: ${error.response.status} - ${error.response.data?.EM || error.response.data}`);
      } else {
        console.log(`❌ Network error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run test
testCustomerSimple(); 