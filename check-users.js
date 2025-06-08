const axios = require('axios');

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...');
    
    const response = await axios.get('http://localhost:1310/users');
    
    if (response.data.EC === 0) {
      const users = response.data.data || [];
      console.log(`✅ Found ${users.length} users:`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.first_name} ${user.last_name} (ID: ${user.id})`);
        console.log(`   📧 Email: ${user.email}`);
        if (user.phone) {
          console.log(`   📞 Phone: ${user.phone}`);
        }
        if (user.user_type) {
          console.log(`   🏷️ Type: ${user.user_type.join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.error('❌ Failed to fetch users:', response.data.EM);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkUsers(); 