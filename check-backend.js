const axios = require('axios');

async function checkBackend() {
  console.log('🔍 Checking if main backend is accessible...');
  
  try {
    // Test basic connectivity
    console.log('📡 Testing connectivity to http://localhost:1310...');
    const healthResponse = await axios.get('http://localhost:1310');
    console.log('✅ Backend is accessible!');
    console.log('Response status:', healthResponse.status);
    
    // Test users endpoint
    console.log('📋 Testing users endpoint...');
    const usersResponse = await axios.get('http://localhost:1310/users');
    console.log('✅ Users endpoint accessible!');
    console.log('Users response EC:', usersResponse.data.EC);
    console.log('Users count:', usersResponse.data.data?.length || 0);
    
    // Test customers endpoint
    console.log('📋 Testing customers endpoint...');
    const customersResponse = await axios.get('http://localhost:1310/customers');
    console.log('✅ Customers endpoint accessible!');
    console.log('Customers response EC:', customersResponse.data.EC);
    console.log('Customers count:', customersResponse.data.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Backend check failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused - main backend is not running on port 1310');
    } else if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkBackend(); 