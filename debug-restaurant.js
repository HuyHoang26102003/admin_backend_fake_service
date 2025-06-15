const axios = require('axios');

async function debugRestaurant() {
  console.log('🐛 Debug Restaurant Creation...');
  
  try {
    // Get a user to test with
    const usersRes = await axios.get('http://127.0.0.1:1310/users');
    const users = usersRes.data.data || [];
    const testUser = users[0];
    
    if (!testUser) {
      console.log('❌ No users found');
      return;
    }
    
    console.log('👤 Using test user:', {
      id: testUser.id,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      email: testUser.email
    });
    
    // Get address books
    const addressRes = await axios.get('http://127.0.0.1:1310/address_books');
    const addresses = addressRes.data.data || [];
    const address = addresses[0];
    
    console.log('🏠 Using address:', address?.id || 'none');
    
    // Try exact DTO structure
    console.log('\n🧪 Test 1: Exact DTO structure');
    const exactData = {
      owner_id: testUser.id,
      owner_name: `${testUser.first_name || 'Test'} ${testUser.last_name || 'Owner'}`,
      address_id: address?.id || '', // Try with actual address ID
      restaurant_name: 'Test Restaurant',
      description: 'A test restaurant for debugging',
      contact_email: [{
        title: 'Primary',
        is_default: true,
        email: testUser.email || 'test@example.com'
      }],
      contact_phone: [{
        title: 'Primary',
        number: '+1234567890',
        is_default: true
      }],
      avatar: {
        url: 'https://example.com/avatar.jpg',
        key: 'test-avatar-key'
      },
      images_gallery: [],
      status: {
        is_open: true,
        is_active: true,
        is_accepted_orders: true
      },
      promotions: [],
      ratings: {
        average_rating: 4.5,
        review_count: 0
      },
      food_category_ids: [],
      opening_hours: {
        mon: { from: 8, to: 22 },
        tue: { from: 8, to: 22 },
        wed: { from: 8, to: 22 },
        thu: { from: 8, to: 22 },
        fri: { from: 8, to: 22 },
        sat: { from: 8, to: 22 },
        sun: { from: 8, to: 22 }
      }
    };
    
    try {
      const res1 = await axios.post('http://127.0.0.1:1310/restaurants-fake', exactData);
      console.log(`✅ Success: EC=${res1.data.EC}, EM=${res1.data.EM}`);
      if (res1.data.data) {
        console.log('📝 Created restaurant ID:', res1.data.data.id);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.EM || error.message}`);
      console.log('📝 Status:', error.response?.status);
      console.log('📝 Full error response:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test 2: Try with required fields only based on the DTO
    console.log('\n🧪 Test 2: Only required fields');
    const requiredOnly = {
      owner_id: testUser.id,
      owner_name: `${testUser.first_name || 'Test'} ${testUser.last_name || 'Owner'}`,
      address_id: address?.id || '',
      restaurant_name: 'Required Test Restaurant',
      contact_email: [{
        title: 'Primary',
        is_default: true,
        email: testUser.email || 'required@example.com'
      }],
      contact_phone: [{
        title: 'Primary',
        number: '+1234567890',
        is_default: true
      }],
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
      }
    };
    
    try {
      const res2 = await axios.post('http://127.0.0.1:1310/restaurants-fake', requiredOnly);
      console.log(`✅ Success: EC=${res2.data.EC}, EM=${res2.data.EM}`);
      if (res2.data.data) {
        console.log('📝 Created restaurant ID:', res2.data.data.id);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.EM || error.message}`);
      console.log('📝 Status:', error.response?.status);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

debugRestaurant(); 