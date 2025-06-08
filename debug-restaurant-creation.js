const axios = require('axios');

async function debugRestaurantCreation() {
  console.log('🔍 Debugging restaurant creation...\n');

  try {
    // First, get a user to use as owner
    const usersResponse = await axios.get('http://localhost:1310/users');
    const users = usersResponse.data.data || [];
    const restaurantOwners = users.filter(user => 
      user.user_type && user.user_type.includes('RESTAURANT_OWNER')
    );

    if (restaurantOwners.length === 0) {
      console.log('❌ No restaurant owners found');
      return;
    }

    const owner = restaurantOwners[0];
    console.log(`👤 Using owner: ${owner.first_name} ${owner.last_name} (ID: ${owner.id})`);

    // Try minimal restaurant data
    const minimalRestaurantData = {
      owner_id: owner.id,
      owner_name: `${owner.first_name} ${owner.last_name}`,
      restaurant_name: 'Test Restaurant',
      contact_email: [{
        title: 'Primary',
        is_default: true,
        email: owner.email || 'test@example.com'
      }],
      contact_phone: [{
        title: 'Primary',
        number: owner.phone || '1234567890',
        is_default: true
      }],
      opening_hours: {
        mon: { from: 28800, to: 79200 },
        tue: { from: 28800, to: 79200 },
        wed: { from: 28800, to: 79200 },
        thu: { from: 28800, to: 79200 },
        fri: { from: 28800, to: 79200 },
        sat: { from: 28800, to: 79200 },
        sun: { from: 28800, to: 79200 }
      },
      status: {
        is_open: true,
        is_active: true,
        is_accepted_orders: true
      }
    };

    console.log('📤 Sending minimal restaurant data:');
    console.log(JSON.stringify(minimalRestaurantData, null, 2));

    const response = await axios.post('http://localhost:1310/restaurants', minimalRestaurantData);
    
    if (response.data.EC === 0) {
      console.log('✅ Restaurant created successfully!');
      console.log('Response:', response.data);
    } else {
      console.log('❌ Restaurant creation failed:');
      console.log('Error:', response.data.EM);
    }

  } catch (error) {
    console.log('❌ Request failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data?.EM || error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

debugRestaurantCreation(); 