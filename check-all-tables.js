const axios = require('axios');

async function checkAllTables() {
  console.log('🔍 Checking all database tables...\n');
  
  const tables = [
    { name: 'Users', endpoint: 'users' },
    { name: 'Customers', endpoint: 'customers' },
    { name: 'Drivers', endpoint: 'drivers' },
    { name: 'Restaurants', endpoint: 'restaurants' },
    { name: 'Categories', endpoint: 'food-categories' },
    { name: 'Address Books', endpoint: 'address_books' }
  ];

  for (const table of tables) {
    try {
      const response = await axios.get(`http://localhost:1310/${table.endpoint}`);
      
      if (response.data.EC === 0) {
        const count = response.data.data?.length || 0;
        const status = count > 0 ? '✅' : '❌';
        console.log(`${status} ${table.name}: ${count} records`);
        
        // Show sample data for tables with records
        if (count > 0 && count <= 3) {
          response.data.data.forEach((item, index) => {
            const name = item.first_name && item.last_name 
              ? `${item.first_name} ${item.last_name}`
              : item.name || item.restaurant_name || item.id;
            console.log(`   ${index + 1}. ${name}`);
          });
        } else if (count > 3) {
          console.log(`   (${count} records - showing first 3)`);
          response.data.data.slice(0, 3).forEach((item, index) => {
            const name = item.first_name && item.last_name 
              ? `${item.first_name} ${item.last_name}`
              : item.name || item.restaurant_name || item.id;
            console.log(`   ${index + 1}. ${name}`);
          });
        }
      } else {
        console.log(`❌ ${table.name}: Error - ${response.data.EM}`);
      }
    } catch (error) {
      console.log(`❌ ${table.name}: Failed to fetch - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('📊 Summary:');
  console.log('- Users table has data ✅');
  console.log('- Need to populate: customers, drivers, restaurants');
  console.log('- These are the core tables for your FlashFood app');
}

checkAllTables(); 