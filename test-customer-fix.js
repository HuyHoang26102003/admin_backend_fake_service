const axios = require('axios');
const { faker } = require('@faker-js/faker');

async function testCustomerCreation() {
  console.log('🧪 Testing Customer Creation After SQL Fix...\n');

  try {
    // Step 1: Create a customer user first
    console.log('👤 Creating customer user...');
    const userData = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 8 }),
      phone: faker.phone.number(),
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };

    const userResponse = await axios.post('http://localhost:1310/users', userData);
    if (userResponse.data.EC !== 0) {
      console.log('❌ Failed to create customer user:', userResponse.data.EM);
      return;
    }

    const customerUser = userResponse.data.data;
    console.log(`✅ Created customer user: ${customerUser.first_name} ${customerUser.last_name} (ID: ${customerUser.id})`);

    // Step 2: Create customer profile with minimal data
    console.log('\n👥 Creating customer profile...');
    const customerData = {
      user_id: customerUser.id,
      first_name: customerUser.first_name,
      last_name: customerUser.last_name
    };

    console.log('📤 Sending customer data:');
    console.log(JSON.stringify(customerData, null, 2));

    const customerResponse = await axios.post('http://localhost:1310/customers', customerData, {
      timeout: 5000
    });

    if (customerResponse.data.EC === 0) {
      console.log('\n🎉 SUCCESS! Customer profile created successfully!');
      console.log('Customer ID:', customerResponse.data.data.id);
      console.log('Customer Name:', `${customerResponse.data.data.first_name} ${customerResponse.data.data.last_name}`);
      
      // Step 3: Verify by checking customers count
      const customersResponse = await axios.get('http://localhost:1310/customers');
      const customerCount = customersResponse.data.data?.length || 0;
      console.log(`\n📊 Total customers in database: ${customerCount}`);
      
      return true;
    } else {
      console.log('\n❌ Customer creation failed:', customerResponse.data.EM);
      return false;
    }

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('\n🕐 Customer creation timed out - SQL fix may not have been applied yet');
    } else {
      console.log('\n❌ Error:', error.response?.data?.EM || error.message);
    }
    return false;
  }
}

async function runMultipleTests() {
  console.log('🔄 Running multiple customer creation tests...\n');
  
  let successCount = 0;
  const totalTests = 3;
  
  for (let i = 1; i <= totalTests; i++) {
    console.log(`\n--- Test ${i}/${totalTests} ---`);
    const success = await testCustomerCreation();
    if (success) successCount++;
    
    if (i < totalTests) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${successCount}/${totalTests} successful`);
  
  if (successCount > 0) {
    console.log('🎉 CUSTOMERS TABLE IS NOW WORKING!');
    console.log('💡 Your auto-generator should now create customers successfully!');
  } else {
    console.log('❌ Customer creation still failing - SQL fix may need to be applied');
    console.log('💡 Please run the SQL script in your NeonDB console');
  }
}

runMultipleTests(); 