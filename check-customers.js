const axios = require('axios');

async function checkCustomers() {
  try {
    console.log('🔍 Checking existing customers...');
    
    const response = await axios.get('http://localhost:1310/customers');
    
    if (response.data.EC === 0) {
      const customers = response.data.data || [];
      console.log(`✅ Found ${customers.length} customers:`);
      
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.first_name} ${customer.last_name} (ID: ${customer.id})`);
        if (customer.phone) {
          console.log(`   📞 Phone: ${customer.phone}`);
        }
        if (customer.user_id) {
          console.log(`   👤 User ID: ${customer.user_id}`);
        }
        console.log('');
      });
    } else {
      console.error('❌ Failed to fetch customers:', response.data.EM);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkCustomers(); 