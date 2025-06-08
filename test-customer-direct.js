const axios = require('axios');
const { faker } = require('@faker-js/faker');

async function testCustomerCreationDirect() {
  console.log('🔍 DIRECT CUSTOMER CREATION TEST');
  console.log('=' .repeat(50));
  
  try {
    // First check if backend is accessible
    console.log('🌐 Testing backend connection...');
    const healthCheck = await axios.get('http://localhost:1310/users');
    console.log(`✅ Backend accessible - Users count: ${healthCheck.data.data?.length || 0}`);
    
    // Step 1: Create a customer user
    console.log('\n👤 Creating customer user...');
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

    console.log('📤 User data:', JSON.stringify(userData, null, 2));

    const userResponse = await axios.post('http://localhost:1310/users', userData);
    
    if (userResponse.data.EC !== 0) {
      console.log('❌ User creation failed:', userResponse.data.EM);
      return;
    }

    const customerUser = userResponse.data.data;
    console.log(`✅ Customer user created: ${customerUser.first_name} ${customerUser.last_name}`);
    console.log(`   User ID: ${customerUser.id}`);

    // Step 2: Try multiple customer creation approaches
    const approaches = [
      {
        name: 'Minimal Required Fields',
        data: {
          user_id: customerUser.id,
          first_name: customerUser.first_name,
          last_name: customerUser.last_name
        }
      },
      {
        name: 'With Empty Arrays',
        data: {
          user_id: customerUser.id,
          first_name: customerUser.first_name,
          last_name: customerUser.last_name,
          address_ids: [],
          preferred_category_ids: [],
          favorite_restaurant_ids: [],
          favorite_items: [],
          support_tickets: [],
          restaurant_history: []
        }
      },
      {
        name: 'With Timestamps',
        data: {
          user_id: customerUser.id,
          first_name: customerUser.first_name,
          last_name: customerUser.last_name,
          created_at: Math.floor(Date.now() / 1000),
          updated_at: Math.floor(Date.now() / 1000)
        }
      }
    ];

    for (let i = 0; i < approaches.length; i++) {
      const approach = approaches[i];
      console.log(`\n🧪 Testing Approach ${i + 1}: ${approach.name}`);
      console.log('📤 Customer data:', JSON.stringify(approach.data, null, 2));
      
             try {
         const startTime = Date.now();
         const customerResponse = await axios.post('http://localhost:1310/customers', approach.data, {
           timeout: 8000
         });
         const endTime = Date.now();
        
        if (customerResponse.data.EC === 0) {
          console.log(`✅ SUCCESS! Customer created in ${endTime - startTime}ms`);
          console.log('Customer ID:', customerResponse.data.data.id);
          console.log('Customer Data:', JSON.stringify(customerResponse.data.data, null, 2));
          
          // Verify it exists
          const verifyResponse = await axios.get('http://localhost:1310/customers');
          const customerCount = verifyResponse.data.data?.length || 0;
          console.log(`📊 Total customers now: ${customerCount}`);
          return true;
        } else {
          console.log(`❌ Failed: ${customerResponse.data.EM}`);
        }
             } catch (error) {
         const endTime = Date.now();
         if (error.code === 'ECONNABORTED') {
           console.log(`🕐 Timed out after ${endTime - startTime}ms - DATABASE CONSTRAINT ISSUE`);
        } else if (error.response) {
          console.log(`❌ Error: ${error.response.data?.EM || error.response.data}`);
          console.log(`   Status: ${error.response.status}`);
        } else {
          console.log(`❌ Network error: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function showDatabaseConstraintInfo() {
  console.log('\n🔧 DATABASE CONSTRAINT ANALYSIS');
  console.log('=' .repeat(50));
  
  console.log('🔍 The issue is likely:');
  console.log('   1. last_login field is NOT NULL in database');
  console.log('   2. BeforeInsert hook is not setting last_login');
  console.log('   3. Database constraint violation causes timeout');
  
  console.log('\n💡 SOLUTIONS:');
  console.log('   Option 1: Run SQL fix in NeonDB:');
  console.log('   ALTER TABLE customers ALTER COLUMN last_login DROP NOT NULL;');
  
  console.log('\n   Option 2: Fix the entity BeforeInsert hook:');
  console.log('   Add: this.last_login = Math.floor(Date.now() / 1000);');
  
  console.log('\n   Option 3: Make field nullable in entity:');
  console.log('   @Column({ name: "last_login", nullable: true })');
}

// Run the test
console.log('🚀 Starting comprehensive customer creation test...\n');
testCustomerCreationDirect()
  .then(() => {
    showDatabaseConstraintInfo();
  })
  .catch(error => {
    console.error('Test crashed:', error);
    showDatabaseConstraintInfo();
  }); 