const axios = require('axios');
const { faker } = require('@faker-js/faker');

class StructuredDatabasePopulator {
  constructor() {
    this.baseURL = 'http://localhost:1310';
    this.createdData = {
      addressBooks: [],
      foodCategories: [],
      superAdmin: null,
      financeAdmins: [],
      companionAdmins: [],
      financeRules: [],
      restaurants: [],
      menuItems: [],
      menuItemVariants: [],
      promotions: [],
      drivers: [],
      customers: [],
      customerCares: [],
      orders: []
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

  // Step 3: Admin Hierarchy (Super Admin -> Finance Admin -> Companion Admin)
  async createAdminHierarchy() {
    console.log('\n👑 STEP 3: Creating Admin Hierarchy...');
    
    // First ensure we have users for admins
    const users = await this.verifyTableData('users', 'Users', true);
    const adminUsers = users.filter(user => 
      user.user_type && (
        user.user_type.includes('SUPER_ADMIN') || 
        user.user_type.includes('FINANCE_ADMIN') || 
        user.user_type.includes('COMPANION_ADMIN') ||
        user.user_type.includes('ADMIN')
      )
    );

    if (adminUsers.length === 0) {
      console.log('❌ CRITICAL: No admin users found!');
      console.log('🛑 STOPPING - Cannot create admins without admin users');
      process.exit(1);
    }

    // Step 3a: Super Admin
    console.log('\n👑 STEP 3a: Creating Super Admin...');
    const existingAdmins = await this.verifyTableData('admin-fake', 'Admins', false);
    const superAdmin = existingAdmins.find(admin => admin.role === 'SUPER_ADMIN');
    
    if (!superAdmin) {
      const superAdminUser = adminUsers.find(user => user.user_type.includes('SUPER_ADMIN')) || adminUsers[0];
      const superAdminData = {
        user_id: superAdminUser.id,
        role: 'SUPER_ADMIN',
        permissions: [
          'MANAGE_USERS', 'MANAGE_RESTAURANTS', 'MANAGE_ORDERS', 
          'MANAGE_PROMOTIONS', 'MANAGE_PAYMENTS', 'MANAGE_SUPPORT',
          'MANAGE_DRIVERS', 'BAN_ACCOUNTS', 'VIEW_ANALYTICS', 'MANAGE_ADMINS'
        ],
        first_name: superAdminUser.first_name,
        last_name: superAdminUser.last_name,
        status: 'ACTIVE',
        assigned_restaurants: [],
        assigned_drivers: [],
        assigned_customer_care: []
      };

      try {
        console.log(`🔄 Attempting to create Super Admin with data:`, JSON.stringify(superAdminData, null, 2));
        const response = await axios.post(`${this.baseURL}/admin-fake`, superAdminData);
        console.log(`📋 Admin creation response:`, JSON.stringify(response.data, null, 2));
        
        if (response.data.EC === 0 || response.data.EC === 'OK') {
          console.log(`✅ Created Super Admin: ${superAdminUser.first_name} ${superAdminUser.last_name}`);
          this.createdData.superAdmin = response.data.data;
        } else {
          console.log(`❌ Failed to create Super Admin: ${response.data.EM}`);
          console.log(`❌ Full response:`, JSON.stringify(response.data, null, 2));
          process.exit(1);
        }
      } catch (error) {
        console.log(`❌ Error creating Super Admin: ${error.response?.data?.EM || error.message}`);
        if (error.response?.data) {
          console.log(`❌ Full error response:`, JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
      }
    } else {
      console.log(`✅ Super Admin already exists: ${superAdmin.first_name} ${superAdmin.last_name}`);
      this.createdData.superAdmin = superAdmin;
    }

    // Verify Super Admin exists
    const verifiedAdmins = await this.verifyTableData('admin-fake', 'Admins', true);
    const verifiedSuperAdmin = verifiedAdmins.find(admin => admin.role === 'SUPER_ADMIN');
    if (!verifiedSuperAdmin) {
      console.log('❌ CRITICAL: Super Admin not found after creation!');
      process.exit(1);
    }

    // Step 3b: Finance Admins
    console.log('\n💰 STEP 3b: Creating Finance Admins...');
    const financeAdmins = verifiedAdmins.filter(admin => admin.role === 'FINANCE_ADMIN');
    const financeAdminsNeeded = Math.max(0, 2 - financeAdmins.length);
    
    for (let i = 0; i < financeAdminsNeeded; i++) {
      const financeUser = adminUsers.find(user => 
        user.user_type.includes('FINANCE_ADMIN') && 
        !verifiedAdmins.some(admin => admin.user_id === user.id)
      ) || adminUsers.find(user => !verifiedAdmins.some(admin => admin.user_id === user.id));
      
      if (!financeUser) continue;

      const financeAdminData = {
        user_id: financeUser.id,
        role: 'FINANCE_ADMIN',
        permissions: ['MANAGE_PAYMENTS', 'MANAGE_PROMOTIONS', 'VIEW_ANALYTICS'],
        first_name: financeUser.first_name,
        last_name: financeUser.last_name,
        status: 'ACTIVE',
        created_by_id: this.createdData.superAdmin.id,
        assigned_restaurants: [],
        assigned_drivers: [],
        assigned_customer_care: []
      };

      try {
        const response = await axios.post(`${this.baseURL}/admin-fake`, financeAdminData);
        if (response.data.EC === 0) {
          console.log(`✅ Created Finance Admin ${i + 1}: ${financeUser.first_name} ${financeUser.last_name}`);
          this.createdData.financeAdmins.push(response.data.data);
        } else {
          console.log(`❌ Failed to create Finance Admin ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error creating Finance Admin ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(300);
    }

    // Step 3c: Companion Admins
    console.log('\n🤝 STEP 3c: Creating Companion Admins...');
    const currentAdmins = await this.verifyTableData('admin-fake', 'Admins', true);
    const companionAdmins = currentAdmins.filter(admin => admin.role === 'COMPANION_ADMIN');
    const companionAdminsNeeded = Math.max(0, 2 - companionAdmins.length);
    
    for (let i = 0; i < companionAdminsNeeded; i++) {
      const companionUser = adminUsers.find(user => 
        user.user_type.includes('COMPANION_ADMIN') && 
        !currentAdmins.some(admin => admin.user_id === user.id)
      ) || adminUsers.find(user => !currentAdmins.some(admin => admin.user_id === user.id));
      
      if (!companionUser) continue;

      const companionAdminData = {
        user_id: companionUser.id,
        role: 'COMPANION_ADMIN',
        permissions: ['MANAGE_RESTAURANTS', 'MANAGE_DRIVERS', 'MANAGE_SUPPORT', 'VIEW_ANALYTICS'],
        first_name: companionUser.first_name,
        last_name: companionUser.last_name,
        status: 'ACTIVE',
        created_by_id: this.createdData.superAdmin.id,
        assigned_restaurants: [],
        assigned_drivers: [],
        assigned_customer_care: []
      };

      try {
        const response = await axios.post(`${this.baseURL}/admin-fake`, companionAdminData);
        if (response.data.EC === 0) {
          console.log(`✅ Created Companion Admin ${i + 1}: ${companionUser.first_name} ${companionUser.last_name}`);
          this.createdData.companionAdmins.push(response.data.data);
        } else {
          console.log(`❌ Failed to create Companion Admin ${i + 1}: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error creating Companion Admin ${i + 1}: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(300);
    }

    // Final verification
    const finalAdmins = await this.verifyTableData('admin-fake', 'Admins', true);
    const finalSuperAdmin = finalAdmins.find(admin => admin.role === 'SUPER_ADMIN');
    if (!finalSuperAdmin) {
      console.log('❌ CRITICAL: Super Admin missing after hierarchy creation!');
      process.exit(1);
    }
  }

  // Step 4: Finance Rules
  async createFinanceRules() {
    console.log('\n💰 STEP 4: Creating Finance Rules...');
    
    if (!this.createdData.superAdmin) {
      console.log('❌ CRITICAL: No Super Admin available for Finance Rules creation!');
      process.exit(1);
    }

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
        created_by_id: this.createdData.superAdmin.id,
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

  async populateDatabase() {
    console.log('🚀 Starting STRUCTURED Database Population...');
    console.log('📋 Order: Address Books → Food Categories → Admin Hierarchy → Finance Rules → ...');
    console.log('⚠️  Will STOP immediately if any step fails!\n');

    try {
      await this.createAddressBooks();
      await this.createFoodCategories();
      await this.createAdminHierarchy();
      await this.createFinanceRules();
      
      console.log('\n🎉 Phase 1 Complete! All critical tables populated.');
      console.log('📊 Ready for next phase: Restaurants → Menu Items → Promotions → Drivers → Customers → Customer Care → Orders');
      
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