const axios = require('axios');

async function checkCounts() {
  try {
    console.log('📊 Checking current counts...');
    
    const restaurants = await axios.get('http://127.0.0.1:1310/restaurants-fake');
    console.log('🏪 Restaurants:', restaurants.data.data?.length || 0);
    
    const customers = await axios.get('http://127.0.0.1:1310/customers-fake');
    console.log('👥 Customers:', customers.data.data?.length || 0);
    
    const users = await axios.get('http://127.0.0.1:1310/users');
    console.log('👤 Users:', users.data.data?.length || 0);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkCounts(); 