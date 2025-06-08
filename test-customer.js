const axios = require('axios');
const { faker } = require('@faker-js/faker');

async function testCustomerGeneration() {
  console.log('🧪 Testing customer generation...');
  
  try {
    // Step 1: Create a test user with CUSTOMER role
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const phone = faker.phone.number();

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: faker.internet.password({ length: 8 }),
      phone: phone,
      user_type: ['CUSTOMER'],
      address: [],
      avatar: {
        url: faker.image.avatar(),
        key: faker.string.uuid()
      },
      is_verified: true
    };

    console.log('📤 Creating user:', { first_name: firstName, last_name: lastName, email });
    const userResponse = await axios.post('http://localhost:1310/users', userData);
    
    if (userResponse.data.EC !== 0) {
      console.error('❌ Failed to create user:', userResponse.data.EM);
      return;
    }

    const createdUser = userResponse.data.data;
    console.log('✅ User created successfully:', createdUser.id);

    // Step 2: Create customer profile
    const customerData = {
      user_id: createdUser.id,
      first_name: firstName,
      last_name: lastName,
      avatar: {
        url: faker.image.avatar(),
        key: faker.string.uuid()
      },
      address_ids: [],
      preferred_category_ids: [],
      favorite_restaurant_ids: [],
      favorite_items: [],
      support_tickets: [],
      app_preferences: {
        theme: 'light'
      },
      restaurant_history: [],
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };

    console.log('📤 Creating customer profile...');
    const customerResponse = await axios.post('http://localhost:1310/customers', customerData);
    
    if (customerResponse.data.EC === 0) {
      console.log('✅ Customer created successfully!');
      console.log('Customer ID:', customerResponse.data.data.id);
    } else {
      console.error('❌ Failed to create customer:', customerResponse.data.EM);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testCustomerGeneration(); 