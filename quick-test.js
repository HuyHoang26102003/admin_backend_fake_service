const axios = require('axios');

async function quickTest() {
  console.log('🚀 Quick Customer Creation Test');
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
    
    console.log('📤 Sending customer data with explicit last_login:');
    console.log(customerData);
    
    try {
      const customerResponse = await axios.post('http://localhost:1310/customers', customerData, {
        timeout: 5000
      });
      
      if (customerResponse.data.EC === 0) {
        const customer = customerResponse.data.data;
        console.log(`✅ SUCCESS! Customer created!`);
        console.log(`   ID: ${customer.id}`);
        console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
        console.log(`   Last Login: ${customer.last_login}`);
        return true;
      } else {
        console.log(`❌ Customer creation failed: ${customerResponse.data.EM}`);
        if (customerResponse.data.DT) {
          console.log('Details:', JSON.stringify(customerResponse.data.DT, null, 2));
        }
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('❌ Request timed out - SQL fix not working or not applied');
      } else if (error.response) {
        console.log(`❌ Error: ${error.response.status} - ${error.response.data?.EM || 'Unknown error'}`);
        console.log('Details:', error.response.data);
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

quickTest(); 