const axios = require('axios');

async function testStructuredApproach() {
  const baseURL = 'http://localhost:1310';
  
  console.log('🧪 Testing Structured Database Population Approach...\n');
  
  const tables = [
    { name: 'Address Books', endpoint: 'address_books', required: true },
    { name: 'Food Categories', endpoint: 'food-categories', required: true },
    { name: 'Admins', endpoint: 'admin-fake', required: true },
    { name: 'Finance Rules', endpoint: 'finance-rules', required: true },
    { name: 'Users', endpoint: 'users', required: false },
    { name: 'Restaurants', endpoint: 'restaurants', required: false },
    { name: 'Drivers', endpoint: 'drivers', required: false },
    { name: 'Customers', endpoint: 'customers', required: false }
  ];

  let canProceed = true;
  
  for (const table of tables) {
    try {
      console.log(`🔍 Checking ${table.name}...`);
      const response = await axios.get(`${baseURL}/${table.endpoint}`);
      const count = response.data.data?.length || 0;
      
      if (table.required && count === 0) {
        console.log(`❌ CRITICAL: No data found in ${table.name}!`);
        console.log(`🛑 Would STOP here in actual population`);
        canProceed = false;
        break;
      }
      
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${table.name}: ${count} records`);
      
    } catch (error) {
      console.log(`❌ ERROR checking ${table.name}: ${error.message}`);
      if (table.required) {
        console.log(`🛑 Would STOP here in actual population`);
        canProceed = false;
        break;
      }
    }
  }

  console.log('\n📊 Test Results:');
  if (canProceed) {
    console.log('✅ All required tables have data - Population can proceed');
    console.log('🚀 Run: node structured-database-populator.js');
  } else {
    console.log('❌ Missing required data - Population would stop');
    console.log('💡 Fix the issues above before running population');
  }
}

testStructuredApproach().catch(console.error); 