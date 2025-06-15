const axios = require('axios');
const { faker } = require('@faker-js/faker');

class StructuredDatabasePopulator {
  constructor() {
    this.baseURL = 'http://127.0.0.1:1310';
    this.createdData = {
      addressBooks: [],
      foodCategories: [],
      superAdmin: null,
      financeAdmins: [],
      companionAdmins: [],
      customerCares: [],
      financeRules: [],
      restaurants: [],
      menuItems: [],
      menuItemVariants: [],
      promotions: [],
      drivers: [],
      customers: [],
      orders: []
    };
    
    // Store credentials for testing sign-in
    this.adminCredentials = {
      superAdmin: null,
      financeAdmins: [],
      companionAdmins: [],
      customerCares: []
    };
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async verifyTableData(endpoint, tableName, required = true) {
    console.log(`🔍 Verifying ${tableName}...`);
    try {
      const response = await axios.get(`${this.baseURL}/${endpoint}`);
      const count = response.data.data?.length || 0;
      
      if (required && count === 0) {
        console.log(`❌ CRITICAL: No data found in ${tableName}!`);
        console.log(`🛑 STOPPING - Cannot proceed without ${tableName} data`);
        process.exit(1);
      }
      
      console.log(`✅ ${tableName}: ${count} records verified`);
      return response.data.data || [];
    } catch (error) {
      console.log(`❌ CRITICAL: Error checking ${tableName}: ${error.message}`);
      console.log(`🛑 STOPPING - Cannot verify ${tableName}`);
      process.exit(1);
    }
  }

  // Step 1: Address Books
  async createAddressBooks() {
    console.log('\n🏠 STEP 1: Creating Address Books...');
    
    const existing = await this.verifyTableData('address_books', 'Address Books', false);
    if (existing.length >= 3) {
      console.log(`📝 Already have ${existing.length} address books`);
      this.createdData.addressBooks = existing;
      return;
    }

    const needed = 5;
    for (let i = 0; i < needed; i++) {
      const addressData = {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        nationality: faker.location.country(),
        postal_code: parseInt(faker.location.zipCode().replace(/\D/g, '')) || 12345,
        location: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude()
        },
        title: faker.helpers.arrayElement(['Home', 'Work', 'Office', 'Other']),
        is_default: i === 0
      };

      try {
        const response = await axios.post(`${this.baseURL}/address_books`, addressData);
        if (response.data.EC === 0) {
          console.log(`✅ Created address ${i + 1}/${needed}: ${addressData.street}`);
          this.createdData.addressBooks.push(response.data.data);
        } else {
          console.log(`❌ Failed to create address ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error creating address ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(200);
    }

    // Verify creation
    await this.verifyTableData('address_books', 'Address Books', true);
  }

  // Step 2: Food Categories
  async createFoodCategories() {
    console.log('\n🍔 STEP 2: Creating Food Categories...');
    
    const existing = await this.verifyTableData('food-categories', 'Food Categories', false);
    if (existing.length >= 3) {
      console.log(`📝 Already have ${existing.length} food categories`);
      this.createdData.foodCategories = existing;
      return;
    }

    const categories = [
      { name: 'Pizza', description: 'Italian pizza varieties' },
      { name: 'Asian Cuisine', description: 'Traditional Asian dishes' },
      { name: 'Burgers', description: 'American style burgers' },
      { name: 'Desserts', description: 'Sweet treats and desserts' },
      { name: 'Beverages', description: 'Drinks and beverages' }
    ];

    for (let i = 0; i < categories.length; i++) {
      const categoryData = {
        name: categories[i].name,
        description: categories[i].description,
        image: {
          url: faker.image.url(),
          key: faker.string.uuid()
        }
      };

      try {
        const response = await axios.post(`${this.baseURL}/food-categories`, categoryData);
        if (response.data.EC === 0) {
          console.log(`✅ Created category ${i + 1}/${categories.length}: ${categoryData.name}`);
          this.createdData.foodCategories.push(response.data.data);
        } else {
          console.log(`❌ Failed to create category ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error creating category ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(200);
    }

    // Verify creation
    await this.verifyTableData('food-categories', 'Food Categories', true);
  }

  // Step 3: Admin Hierarchy using REGISTRATION endpoints
  async createAdminHierarchy() {
    console.log('\n👑 STEP 3: Creating Admin Hierarchy using PROPER REGISTRATION...');

    // Step 3a: Super Admin
    console.log('\n👑 STEP 3a: Creating Super Admin (SIGNABLE ACCOUNT)...');
    const existingAdmins = await this.verifyTableData('admin-fake', 'Admins', false);
    const superAdmin = existingAdmins.find(admin => admin.role === 'SUPER_ADMIN');
    
    if (!superAdmin) {
      const superAdminData = {
        email: `superadmin_${Date.now()}@flashfood.com`,
        password: 'Admin123!',
        first_name: 'Super',
        last_name: 'Admin',
        phone: faker.phone.number()
      };

      try {
        console.log(`🔄 Registering Super Admin: ${superAdminData.email}`);
        const response = await axios.post(`${this.baseURL}/auth/register-super-admin`, superAdminData);
        
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Registered Super Admin: ${superAdminData.first_name} ${superAdminData.last_name}`);
          console.log(`🔐 Email: ${superAdminData.email} | Password: ${superAdminData.password}`);
          this.adminCredentials.superAdmin = {
            email: superAdminData.email,
            password: superAdminData.password,
            role: 'SUPER_ADMIN'
          };
        } else {
          console.log(`❌ Failed to register Super Admin: ${response.data.EM}`);
          process.exit(1);
        }
      } catch (error) {
        console.log(`❌ Error registering Super Admin: ${error.response?.data?.EM || error.message}`);
        process.exit(1);
      }
    } else {
      console.log(`✅ Super Admin already exists: ${superAdmin.first_name} ${superAdmin.last_name}`);
    }

    await this.delay(1000); // Wait for email processing

    // Step 3b: Finance Admins
    console.log('\n💰 STEP 3b: Creating Finance Admins (SIGNABLE ACCOUNTS)...');
    const verifiedAdmins = await this.verifyTableData('admin-fake', 'Admins', true);
    const financeAdmins = verifiedAdmins.filter(admin => admin.role === 'FINANCE_ADMIN');
    const financeAdminsNeeded = Math.max(0, 2 - financeAdmins.length);
    
    for (let i = 0; i < financeAdminsNeeded; i++) {
      const financeAdminData = {
        email: `financeadmin_${Date.now()}_${i}@flashfood.com`,
        password: 'Finance123!',
        first_name: `Finance`,
        last_name: `Admin ${i + 1}`,
        phone: faker.phone.number()
      };

      try {
        console.log(`🔄 Registering Finance Admin ${i + 1}: ${financeAdminData.email}`);
        const response = await axios.post(`${this.baseURL}/auth/register-finance-admin`, financeAdminData);
        
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Registered Finance Admin ${i + 1}: ${financeAdminData.first_name} ${financeAdminData.last_name}`);
          console.log(`🔐 Email: ${financeAdminData.email} | Password: ${financeAdminData.password}`);
          this.adminCredentials.financeAdmins.push({
            email: financeAdminData.email,
            password: financeAdminData.password,
            role: 'FINANCE_ADMIN'
          });
        } else {
          console.log(`❌ Failed to register Finance Admin ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error registering Finance Admin ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(1000);
    }

    // Step 3c: Companion Admins
    console.log('\n🤝 STEP 3c: Creating Companion Admins (SIGNABLE ACCOUNTS)...');
    const currentAdmins = await this.verifyTableData('admin-fake', 'Admins', true);
    const companionAdmins = currentAdmins.filter(admin => admin.role === 'COMPANION_ADMIN');
    const companionAdminsNeeded = Math.max(0, 2 - companionAdmins.length);
    
    for (let i = 0; i < companionAdminsNeeded; i++) {
      const companionAdminData = {
        email: `companionadmin_${Date.now()}_${i}@flashfood.com`,
        password: 'Companion123!',
        first_name: `Companion`,
        last_name: `Admin ${i + 1}`,
        phone: faker.phone.number()
      };

      try {
        console.log(`🔄 Registering Companion Admin ${i + 1}: ${companionAdminData.email}`);
        const response = await axios.post(`${this.baseURL}/auth/register-companion-admin`, companionAdminData);
        
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Registered Companion Admin ${i + 1}: ${companionAdminData.first_name} ${companionAdminData.last_name}`);
          console.log(`🔐 Email: ${companionAdminData.email} | Password: ${companionAdminData.password}`);
          this.adminCredentials.companionAdmins.push({
            email: companionAdminData.email,
            password: companionAdminData.password,
            role: 'COMPANION_ADMIN'
          });
        } else {
          console.log(`❌ Failed to register Companion Admin ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error registering Companion Admin ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(1000);
    }

    // Final verification
    const finalAdmins = await this.verifyTableData('admin-fake', 'Admins', true);
    const finalSuperAdmin = finalAdmins.find(admin => admin.role === 'SUPER_ADMIN');
    if (!finalSuperAdmin) {
      console.log('❌ CRITICAL: Super Admin missing after hierarchy creation!');
      process.exit(1);
    }
  }

  // Step 4: Customer Care (SIGNABLE ACCOUNTS)
  async createCustomerCares() {
    console.log('\n📞 STEP 4: Creating Customer Care Representatives (SIGNABLE ACCOUNTS)...');
    
    const existing = await this.verifyTableData('customer-cares', 'Customer Cares', false);
    if (existing.length >= 2) {
      console.log(`📝 Already have ${existing.length} customer care representatives`);
      this.createdData.customerCares = existing;
      return;
    }

    const needed = 3;
    for (let i = 0; i < needed; i++) {
      const customerCareData = {
        email: `customercare_${Date.now()}_${i}@flashfood.com`,
        password: 'CustomerCare123!',
        first_name: `Customer Care`,
        last_name: `Rep ${i + 1}`,
        phone: faker.phone.number()
      };

      try {
        console.log(`🔄 Registering Customer Care ${i + 1}: ${customerCareData.email}`);
        const response = await axios.post(`${this.baseURL}/auth/register-customer-care`, customerCareData);
        
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Registered Customer Care ${i + 1}: ${customerCareData.first_name} ${customerCareData.last_name}`);
          console.log(`🔐 Email: ${customerCareData.email} | Password: ${customerCareData.password}`);
          this.adminCredentials.customerCares.push({
            email: customerCareData.email,
            password: customerCareData.password,
            role: 'CUSTOMER_CARE'
          });
        } else {
          console.log(`❌ Failed to register Customer Care ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error registering Customer Care ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(1000);
    }

    // Verify creation
    await this.verifyTableData('customer-cares', 'Customer Cares', true);
  }

  // Step 5: Restaurants (using fake API)
  async createRestaurants() {
    console.log('\n🏪 STEP 5: Creating Restaurants (using fake API)...');
    
    const existing = await this.verifyTableData('restaurants-fake', 'Restaurants', false);
    if (existing.length >= 5) {
      console.log(`📝 Already have ${existing.length} restaurants`);
      this.createdData.restaurants = existing;
      return;
    }

    // Get existing users for restaurant owners
    const users = await this.verifyTableData('users', 'Users', true);
    const restaurantOwners = users.filter(user => 
      user.user_type && user.user_type.includes('RESTAURANT_OWNER')
    );

    if (restaurantOwners.length === 0) {
      console.log('⚠️ No restaurant owner users found, creating restaurants with existing users...');
      // Use first few users as restaurant owners if no specific restaurant owners exist
      const availableUsers = users.slice(0, 8);
      if (availableUsers.length === 0) {
        console.log('❌ No users found at all, skipping restaurant creation');
        return;
      }
      console.log(`🔄 Using ${availableUsers.length} existing users as restaurant owners`);
      restaurantOwners.push(...availableUsers);
    }

    const needed = Math.min(8, restaurantOwners.length);
    console.log(`🍽️ Creating ${needed} restaurants using existing restaurant owners...`);

    for (let i = 0; i < needed; i++) {
      const owner = restaurantOwners[i];
      const addressBook = this.createdData.addressBooks[i % this.createdData.addressBooks.length];
      const foodCategories = this.createdData.foodCategories.slice(0, 2); // Use first 2 categories

      const restaurantData = {
        owner_id: owner.id,
        owner_name: `${owner.first_name || 'Restaurant'} ${owner.last_name || 'Owner'}`,
        restaurant_name: `${faker.company.name()} Restaurant`,
        description: faker.lorem.sentences(2),
        address_id: addressBook?.id || (this.createdData.addressBooks[0]?.id || ''),
        contact_email: [{
          title: 'Primary',
          is_default: true,
          email: owner.email || faker.internet.email()
        }],
        contact_phone: [{
          title: 'Primary',
          number: owner.phone || faker.phone.number(),
          is_default: true
        }],
        avatar: {
          url: faker.image.url(),
          key: faker.string.uuid()
        },
        images_gallery: [],
        status: {
          is_open: faker.datatype.boolean(),
          is_active: true,
          is_accepted_orders: faker.datatype.boolean()
        },
        promotions: [],
        opening_hours: {
          mon: { from: 8, to: 22 },
          tue: { from: 8, to: 22 },
          wed: { from: 8, to: 22 },
          thu: { from: 8, to: 22 },
          fri: { from: 8, to: 23 },
          sat: { from: 9, to: 23 },
          sun: { from: 9, to: 21 }
        },
        ratings: {
          average_rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
          review_count: faker.number.int({ min: 10, max: 500 })
        },
        food_category_ids: foodCategories.length > 0 ? foodCategories.map(cat => cat.id) : []
      };

      try {
        const response = await axios.post(`${this.baseURL}/restaurants-fake`, restaurantData);
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Created restaurant ${i + 1}/${needed}: ${restaurantData.restaurant_name}`);
          this.createdData.restaurants.push(response.data.data);
        } else {
          console.log(`❌ Failed to create restaurant ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error creating restaurant ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(500);
    }

    // Verify creation (non-critical)
    const finalRestaurants = await this.verifyTableData('restaurants-fake', 'Restaurants', false);
    console.log(`✅ Final restaurants count: ${finalRestaurants.length}`);
  }

  // Step 6: Customers (using fake API)
  async createCustomers() {
    console.log('\n👥 STEP 6: Creating Customers (using fake API)...');
    
    const existing = await this.verifyTableData('customers-fake', 'Customers', false);
    if (existing.length >= 10) {
      console.log(`📝 Already have ${existing.length} customers`);
      this.createdData.customers = existing;
      return;
    }

    // Get existing users for customers
    const users = await this.verifyTableData('users', 'Users', true);
    const customerUsers = users.filter(user => 
      user.user_type && user.user_type.includes('CUSTOMER')
    );

    if (customerUsers.length === 0) {
      console.log('⚠️ No customer users found, using existing users as customers...');
      // Use existing users as customers if no specific customer users exist
      const availableUsers = users.slice(0, 15);
      if (availableUsers.length === 0) {
        console.log('❌ No users found at all, skipping customer creation');
        return;
      }
      console.log(`🔄 Using ${availableUsers.length} existing users as customers`);
      customerUsers.push(...availableUsers);
    }

    const needed = Math.min(15, customerUsers.length);
    console.log(`👤 Creating ${needed} customers using existing customer users...`);

    for (let i = 0; i < needed; i++) {
      const user = customerUsers[i];
      const addressBooks = this.createdData.addressBooks.slice(0, 2); // Use first 2 addresses
      const foodCategories = this.createdData.foodCategories.slice(0, 3); // Use first 3 categories
      const restaurants = this.createdData.restaurants.slice(0, 2); // Use first 2 restaurants

      const customerData = {
        user_id: user.id,
        first_name: user.first_name || faker.person.firstName(),
        last_name: user.last_name || faker.person.lastName(),
        address: faker.location.streetAddress(),
        avatar: {
          url: faker.image.avatar(),
          key: faker.string.uuid()
        },
        address_ids: addressBooks.length > 0 ? addressBooks.map(addr => addr.id) : [],
        preferred_category_ids: foodCategories.length > 0 ? foodCategories.map(cat => cat.id) : [],
        favorite_restaurant_ids: restaurants.length > 0 ? restaurants.map(rest => rest.id) : [],
        favorite_items: [],
        support_tickets: [],
        app_preferences: {
          theme: faker.helpers.arrayElement(['light', 'dark'])
        },
        restaurant_history: restaurants.length > 0 ? restaurants.map(rest => ({
          restaurant_id: rest.id,
          count: faker.number.int({ min: 1, max: 10 })
        })) : []
      };

      try {
        const response = await axios.post(`${this.baseURL}/customers-fake`, customerData);
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Created customer ${i + 1}/${needed}: ${customerData.first_name} ${customerData.last_name}`);
          this.createdData.customers.push(response.data.data);
        } else {
          console.log(`❌ Failed to create customer ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error creating customer ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(300);
    }

    // Verify creation (non-critical)
    const finalCustomers = await this.verifyTableData('customers-fake', 'Customers', false);
    console.log(`✅ Final customers count: ${finalCustomers.length}`);
  }

  // Step 7: Finance Rules
  async createFinanceRules() {
    console.log('\n💰 STEP 7: Creating Finance Rules...');
    
    const existing = await this.verifyTableData('finance-rules', 'Finance Rules', false);
    if (existing.length >= 2) {
      console.log(`📝 Already have ${existing.length} finance rules`);
      this.createdData.financeRules = existing;
      return;
    }

    const needed = 3;
    for (let i = 0; i < needed; i++) {
      const ruleData = {
        driver_fixed_wage: {
          '0-1km': 15000,
          '1-2km': 20000,
          '2-3km': 25000,
          '4-5km': 30000,
          '>5km': '35000 + 5000/km'
        },
        customer_care_hourly_wage: 50000,
        app_service_fee: 0.15,
        restaurant_commission: 0.20,
        description: `Finance Rule Set ${i + 1} - Standard rates`
      };

      try {
        const response = await axios.post(`${this.baseURL}/finance-rules`, ruleData);
        if (response.data.EC === 0) {
          console.log(`✅ Created Finance Rule ${i + 1}/${needed}`);
          this.createdData.financeRules.push(response.data.data);
        } else {
          console.log(`❌ Failed to create Finance Rule ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error creating Finance Rule ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(200);
    }

    // Verify creation
    await this.verifyTableData('finance-rules', 'Finance Rules', true);
  }

  // Test sign-in capabilities
  async testSignInAccounts() {
    console.log('\n🔐 TESTING SIGN-IN CAPABILITIES...');
    
    // Test Super Admin login
    if (this.adminCredentials.superAdmin) {
      try {
        console.log(`🧪 Testing Super Admin login...`);
        const response = await axios.post(`${this.baseURL}/auth/login-super-admin`, {
          email: this.adminCredentials.superAdmin.email,
          password: this.adminCredentials.superAdmin.password
        });
        
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Super Admin can sign in successfully!`);
          console.log(`🎫 Access token generated: ${response.data.data.access_token ? 'YES' : 'NO'}`);
        } else {
          console.log(`❌ Super Admin sign-in failed: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Super Admin sign-in error: ${error.response?.data?.EM || error.message}`);
      }
    }

    // Test Customer Care login
    if (this.adminCredentials.customerCares.length > 0) {
      try {
        const customerCare = this.adminCredentials.customerCares[0];
        console.log(`🧪 Testing Customer Care login...`);
        const response = await axios.post(`${this.baseURL}/auth/login-customer-care`, {
          email: customerCare.email,
          password: customerCare.password
        });
        
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Customer Care can sign in successfully!`);
          console.log(`🎫 Access token generated: ${response.data.data.access_token ? 'YES' : 'NO'}`);
        } else {
          console.log(`❌ Customer Care sign-in failed: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Customer Care sign-in error: ${error.response?.data?.EM || error.message}`);
      }
    }
  }

  // Print all credentials
  async printCredentials() {
    console.log('\n🔐 ================ SIGN-IN CREDENTIALS ================');
    console.log('📋 Use these accounts to sign in to your frontend:');
    console.log('');
    
    if (this.adminCredentials.superAdmin) {
      console.log('👑 SUPER ADMIN:');
      console.log(`   Email: ${this.adminCredentials.superAdmin.email}`);
      console.log(`   Password: ${this.adminCredentials.superAdmin.password}`);
      console.log(`   Endpoint: POST /auth/login-super-admin`);
      console.log('');
    }

    if (this.adminCredentials.financeAdmins.length > 0) {
      console.log('💰 FINANCE ADMINS:');
      this.adminCredentials.financeAdmins.forEach((admin, i) => {
        console.log(`   ${i + 1}. Email: ${admin.email}`);
        console.log(`      Password: ${admin.password}`);
        console.log(`      Endpoint: POST /auth/login-finance-admin`);
      });
      console.log('');
    }

    if (this.adminCredentials.companionAdmins.length > 0) {
      console.log('🤝 COMPANION ADMINS:');
      this.adminCredentials.companionAdmins.forEach((admin, i) => {
        console.log(`   ${i + 1}. Email: ${admin.email}`);
        console.log(`      Password: ${admin.password}`);
        console.log(`      Endpoint: POST /auth/login-companion-admin`);
      });
      console.log('');
    }

    if (this.adminCredentials.customerCares.length > 0) {
      console.log('📞 CUSTOMER CARE REPS:');
      this.adminCredentials.customerCares.forEach((care, i) => {
        console.log(`   ${i + 1}. Email: ${care.email}`);
        console.log(`      Password: ${care.password}`);
        console.log(`      Endpoint: POST /auth/login-customer-care`);
      });
      console.log('');
    }
    
    console.log('====================================================');
  }

  async populateDatabase() {
    console.log('🚀 Starting STRUCTURED Database Population with SIGNABLE ACCOUNTS...');
    console.log('📋 Order: Address Books → Food Categories → Admin Hierarchy → Customer Care → Restaurants → Customers → Finance Rules');
    console.log('⚠️  Will STOP immediately if any step fails!');
    console.log('🔐 Creating accounts you can ACTUALLY SIGN IN with!\n');

    try {
      await this.createAddressBooks();
      await this.createFoodCategories();
      await this.createAdminHierarchy();
      await this.createCustomerCares();
      await this.createRestaurants();
      await this.createCustomers();
      await this.createFinanceRules();
      
      console.log('\n🎉 Phase 1 Complete! All critical tables populated with SIGNABLE ACCOUNTS!');
      
      await this.testSignInAccounts();
      await this.printCredentials();
      
      console.log('\n🎊 SUCCESS! You now have accounts that can sign in to manage your frontend!');
      
    } catch (error) {
      console.error('\n❌ POPULATION FAILED:', error.message);
      console.log('🛑 Process stopped due to critical error');
      process.exit(1);
    }
  }
}

// Execute population
const populator = new StructuredDatabasePopulator();
populator.populateDatabase(); 