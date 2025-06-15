const axios = require('axios');

async function quickTest() {
  console.log('🧪 Quick Test - Checking Restaurants & Customers...');
  
  try {
    // Check restaurants
    console.log('\n🏪 Checking Restaurants...');
    const restaurantsRes = await axios.get('http://127.0.0.1:1310/restaurants-fake');
    console.log(`✅ Restaurants endpoint works. Count: ${restaurantsRes.data.data?.length || 0}`);
    
    // Check customers
    console.log('\n👥 Checking Customers...');
    const customersRes = await axios.get('http://127.0.0.1:1310/customers-fake');
    console.log(`✅ Customers endpoint works. Count: ${customersRes.data.data?.length || 0}`);
    
    // Check users for reference
    console.log('\n👤 Checking Users...');
    const usersRes = await axios.get('http://127.0.0.1:1310/users');
    const users = usersRes.data.data || [];
    console.log(`✅ Users count: ${users.length}`);
    
    // Check user types
    const userTypes = new Set();
    users.forEach(user => {
      if (user.user_type && Array.isArray(user.user_type)) {
        user.user_type.forEach(type => userTypes.add(type));
      }
    });
    console.log('📋 User types found:', Array.from(userTypes));
    
    // Test creating one restaurant
    console.log('\n🧪 Testing restaurant creation...');
    const testUser = users[0];
    if (testUser) {
      const testRestaurantData = {
        owner_id: testUser.id,
        owner_name: `${testUser.first_name || 'Test'} ${testUser.last_name || 'Owner'}`,
        restaurant_name: 'Test Restaurant',
        description: 'A test restaurant',
        address_id: '',
        contact_email: [{
          title: 'Primary',
          is_default: true,
          email: testUser.email || 'test@example.com'
        }],
        contact_phone: [{
          title: 'Primary',
          number: testUser.phone || '+1234567890',
          is_default: true
        }],
        avatar: {
          url: 'https://example.com/avatar.jpg',
          key: 'test-key'
        },
        status: {
          is_open: true,
          is_active: true,
          is_accepted_orders: true
        },
        opening_hours: {
          mon: { from: 8, to: 22 },
          tue: { from: 8, to: 22 },
          wed: { from: 8, to: 22 },
          thu: { from: 8, to: 22 },
          fri: { from: 8, to: 22 },
          sat: { from: 8, to: 22 },
          sun: { from: 8, to: 22 }
        },
        food_category_ids: []
      };
      
      try {
        const createRes = await axios.post('http://127.0.0.1:1310/restaurants-fake', testRestaurantData);
        console.log(`✅ Restaurant creation test: Success`);
        console.log(`📝 Response: EC=${createRes.data.EC}, EM=${createRes.data.EM}`);
      } catch (error) {
        console.log(`❌ Restaurant creation test failed: ${error.response?.data?.EM || error.message}`);
        console.log(`📝 Response data:`, error.response?.data);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

quickTest(); 