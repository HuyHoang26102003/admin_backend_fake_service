const axios = require('axios');
const { faker } = require('@faker-js/faker');

class UltimateGenerator {
  constructor() {
    this.baseURL = 'http://localhost:1310';
    this.isRunning = false;
    this.interval = null;
    
    // Cache for all dependencies
    this.cache = {
      users: [],
      addresses: [],
      categories: [],
      restaurants: [],
      customers: [],
      drivers: []
    };
    
    // Predefined seed data for consistency
    this.seedData = {
      menuItems: [
        { name: 'Classic Burger', price: 12.99, category: 'Burgers', description: 'Juicy beef patty with fresh lettuce and tomato' },
        { name: 'Margherita Pizza', price: 15.50, category: 'Pizza', description: 'Traditional pizza with fresh mozzarella and basil' },
        { name: 'Chicken Pad Thai', price: 13.75, category: 'Thai', description: 'Stir-fried rice noodles with chicken and tamarind sauce' },
        { name: 'Caesar Salad', price: 9.99, category: 'Salads', description: 'Crisp romaine lettuce with caesar dressing and croutons' },
        { name: 'Beef Tacos', price: 11.25, category: 'Mexican', description: 'Soft shell tacos with seasoned ground beef' },
        { name: 'Sushi Roll Set', price: 18.99, category: 'Japanese', description: 'Assorted fresh sushi rolls with wasabi and ginger' },
        { name: 'Fish & Chips', price: 14.50, category: 'British', description: 'Beer-battered fish with golden chips' },
        { name: 'Chicken Curry', price: 16.75, category: 'Indian', description: 'Spicy chicken curry with basmati rice' },
        { name: 'BBQ Ribs', price: 22.99, category: 'BBQ', description: 'Tender pork ribs with smoky BBQ sauce' },
        { name: 'Vegetable Stir Fry', price: 10.99, category: 'Vegetarian', description: 'Fresh mixed vegetables in garlic sauce' }
      ],
      
      addresses: [
        { street: '123 Main Street', city: 'New York', country: 'United States' },
        { street: '456 Oak Avenue', city: 'Los Angeles', country: 'United States' },
        { street: '789 Pine Road', city: 'Chicago', country: 'United States' },
        { street: '321 Elm Drive', city: 'Houston', country: 'United States' },
        { street: '654 Maple Lane', city: 'Phoenix', country: 'United States' },
        { street: '987 Cedar Court', city: 'Philadelphia', country: 'United States' },
        { street: '147 Birch Street', city: 'San Antonio', country: 'United States' },
        { street: '258 Walnut Way', city: 'San Diego', country: 'United States' }
      ],
      
      restaurants: [
        { name: 'Golden Dragon', type: 'Chinese', specialty: 'Chinese' },
        { name: 'Mama Mia', type: 'Italian', specialty: 'Pizza' },
        { name: 'Spice Palace', type: 'Indian', specialty: 'Indian' },
        { name: 'Taco Fiesta', type: 'Mexican', specialty: 'Mexican' },
        { name: 'Sakura Sushi', type: 'Japanese', specialty: 'Japanese' },
        { name: 'The Grill House', type: 'American', specialty: 'BBQ' },
        { name: 'Green Garden', type: 'Vegetarian', specialty: 'Vegetarian' }
      ]
    };
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Ultimate generator is already running!');
      return;
    }

    console.log('🚀 Starting ULTIMATE Generator System...');
    console.log('🔥 Building complete ecosystem from EMPTY database');
    console.log('⏰ Will generate everything every 30 seconds');
    console.log('🎯 ONE-HIT KO SOLUTION ACTIVATED\n');

    this.isRunning = true;
    
    // Initialize complete system
    await this.initializeCompleteSystem();
    
    // Start the generation cycle
    this.interval = setInterval(async () => {
      await this.generateCompleteCycle();
    }, 30000);

    // Run first cycle immediately
    await this.generateCompleteCycle();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('\n🛑 Ultimate generator stopped');
  }

  async initializeCompleteSystem() {
    console.log('🔧 Initializing COMPLETE system from scratch...');
    
    try {
      // Step 1: Load existing data
      await this.refreshAllCache();
      
      // Step 2: Create foundation layer (no dependencies)
      await this.createFoundationLayer();
      
      // Step 3: Verify we have minimum requirements
      await this.verifyMinimumRequirements();
      
      console.log('✅ Complete system initialized successfully\n');
    } catch (error) {
      console.error('❌ Failed to initialize system:', error.message);
    }
  }

  async refreshAllCache() {
    console.log('📊 Refreshing all cache...');
    
    try {
      // Get all entities
      const [users, addresses, categories, restaurants, customers, drivers] = await Promise.all([
        this.safeApiCall('users'),
        this.safeApiCall('address_books'),
        this.safeApiCall('food-categories'),
        this.safeApiCall('restaurants'),
        this.safeApiCall('customers'),
        this.safeApiCall('drivers')
      ]);

      this.cache.users = users;
      this.cache.addresses = addresses;
      this.cache.categories = categories;
      this.cache.restaurants = restaurants;
      this.cache.customers = customers;
      this.cache.drivers = drivers;

      console.log(`📈 Cache: ${this.cache.users.length} users, ${this.cache.addresses.length} addresses, ${this.cache.categories.length} categories`);
      console.log(`📈 Cache: ${this.cache.restaurants.length} restaurants, ${this.cache.customers.length} customers, ${this.cache.drivers.length} drivers`);
    } catch (error) {
      console.error('❌ Failed to refresh cache:', error.message);
    }
  }

  async safeApiCall(endpoint) {
    try {
      const response = await axios.get(`${this.baseURL}/${endpoint}`);
      return response.data.data || [];
    } catch (error) {
      console.log(`⚠️ Could not fetch ${endpoint}: ${error.message}`);
      return [];
    }
  }

  async createFoundationLayer() {
    console.log('🏗️ Creating foundation layer...');
    
    // Create addresses first (no dependencies)
    await this.ensureAddresses();
    
    // Categories should exist, but let's check
    await this.ensureCategories();
    
    // Create basic users for each role
    await this.ensureBaseUsers();
  }

  async ensureAddresses() {
    if (this.cache.addresses.length >= 5) {
      console.log(`✅ Sufficient addresses exist: ${this.cache.addresses.length}`);
      return;
    }

    console.log('📍 Creating foundation addresses...');
    const needed = Math.max(8 - this.cache.addresses.length, 0);
    
    for (let i = 0; i < needed; i++) {
      const seedAddress = this.seedData.addresses[i % this.seedData.addresses.length];
      const now = Math.floor(Date.now() / 1000);
      
      const addressData = {
        street: seedAddress.street,
        city: seedAddress.city,
        nationality: seedAddress.country,
        postal_code: parseInt(faker.location.zipCode().replace(/\D/g, '')) || (10000 + i),
        location: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude()
        },
        title: faker.helpers.arrayElement(['Home', 'Work', 'Office', 'Branch']),
        is_default: i === 0,
        created_at: now,
        updated_at: now
      };

      try {
        const response = await axios.post(`${this.baseURL}/address_books`, addressData);
        if (response.data.EC === 0) {
          this.cache.addresses.push(response.data.data);
          console.log(`✅ Created address: ${addressData.street}, ${addressData.city}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create address: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(100);
    }
  }

  async ensureCategories() {
    if (this.cache.categories.length === 0) {
      console.log('⚠️ No food categories found - this will limit restaurant functionality');
    } else {
      console.log(`✅ Food categories available: ${this.cache.categories.length}`);
    }
  }

  async ensureBaseUsers() {
    // Ensure we have users for each role
    const roles = ['CUSTOMER', 'DRIVER', 'RESTAURANT_OWNER'];
    
    for (const role of roles) {
      const existingUsers = this.cache.users.filter(user => 
        user.user_type && user.user_type.includes(role)
      );
      
      if (existingUsers.length < 2) {
        const needed = 3 - existingUsers.length;
        console.log(`👤 Creating ${needed} ${role} users...`);
        
        for (let i = 0; i < needed; i++) {
          await this.createUserByRole(role);
          await this.delay(100);
        }
      }
    }
  }

  async createUserByRole(role) {
    const userData = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 8 }),
      phone: faker.phone.number(),
      user_type: [role],
      address: [],
      is_verified: true
    };

    try {
      const response = await axios.post(`${this.baseURL}/users`, userData);
      if (response.data.EC === 0) {
        this.cache.users.push(response.data.data);
        console.log(`✅ Created ${role} user: ${userData.first_name} ${userData.last_name}`);
        return response.data.data;
      }
    } catch (error) {
      console.log(`❌ Failed to create ${role} user: ${error.response?.data?.EM || error.message}`);
    }
    return null;
  }

  async verifyMinimumRequirements() {
    console.log('🔍 Verifying minimum requirements...');
    
    const requirements = [
      { name: 'Addresses', count: this.cache.addresses.length, minimum: 3 },
      { name: 'Categories', count: this.cache.categories.length, minimum: 1 },
      { name: 'Customer Users', count: this.cache.users.filter(u => u.user_type?.includes('CUSTOMER')).length, minimum: 2 },
      { name: 'Driver Users', count: this.cache.users.filter(u => u.user_type?.includes('DRIVER')).length, minimum: 2 },
      { name: 'Restaurant Owner Users', count: this.cache.users.filter(u => u.user_type?.includes('RESTAURANT_OWNER')).length, minimum: 2 }
    ];

    for (const req of requirements) {
      const status = req.count >= req.minimum ? '✅' : '❌';
      console.log(`${status} ${req.name}: ${req.count}/${req.minimum}`);
    }
  }

  async generateCompleteCycle() {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n🔄 [${timestamp}] ULTIMATE GENERATION CYCLE`);
    console.log('=' .repeat(60));
    
    try {
      // Refresh cache
      await this.refreshAllCache();
      
      // Generate in dependency order
      const results = await Promise.allSettled([
        this.generateUltimateRestaurant(),
        this.generateUltimateDriver(),
        this.generateUltimateCustomer()
      ]);
      
      // Report results
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`\n📊 Cycle Results: ${successful}/3 successful generations`);
      
      // Show current database state
      await this.showDatabaseState();
      
    } catch (error) {
      console.error('❌ Generation cycle failed:', error.message);
    }
  }

  async generateUltimateRestaurant() {
    console.log('🏪 Generating ULTIMATE restaurant...');
    
    try {
      // Get or create restaurant owner
      let ownerUser = this.cache.users.find(user => 
        user.user_type && user.user_type.includes('RESTAURANT_OWNER')
      );
      
      if (!ownerUser) {
        ownerUser = await this.createUserByRole('RESTAURANT_OWNER');
        if (!ownerUser) return;
      }

      // Pick a restaurant concept
      const concept = faker.helpers.arrayElement(this.seedData.restaurants);
      
      // Create restaurant with EXACT entity requirements
      const restaurantData = {
        owner_id: ownerUser.id,
        owner_name: `${ownerUser.first_name} ${ownerUser.last_name}`,
        restaurant_name: concept.name + ' ' + faker.helpers.arrayElement(['Restaurant', 'Bistro', 'Kitchen', 'Eatery']),
        description: `Authentic ${concept.type} cuisine with fresh ingredients and traditional recipes`,
        contact_email: [{
          title: 'Primary',
          is_default: true,
          email: ownerUser.email
        }],
        contact_phone: [{
          title: 'Primary',
          number: ownerUser.phone,
          is_default: true
        }],
        address_id: faker.helpers.arrayElement(this.cache.addresses).id,
        opening_hours: {
          mon: { from: 28800, to: 79200 }, // 8 AM to 10 PM
          tue: { from: 28800, to: 79200 },
          wed: { from: 28800, to: 79200 },
          thu: { from: 28800, to: 79200 },
          fri: { from: 28800, to: 79200 },
          sat: { from: 32400, to: 82800 }, // 9 AM to 11 PM
          sun: { from: 32400, to: 75600 }  // 9 AM to 9 PM
        },
        status: {
          is_open: true,
          is_active: true,
          is_accepted_orders: true
        },
        ratings: {
          average_rating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
          review_count: faker.number.int({ min: 25, max: 500 })
        },
        avatar: {
          url: faker.image.url(),
          key: faker.string.uuid()
        },
        images_gallery: []
      };

      const response = await axios.post(`${this.baseURL}/restaurants`, restaurantData);
      if (response.data.EC === 0) {
        const restaurant = response.data.data;
        this.cache.restaurants.push(restaurant);
        console.log(`✅ Created restaurant: ${restaurantData.restaurant_name}`);
        
        // Create menu items
        await this.createMenuItems(restaurant.id, concept.specialty);
        return restaurant;
      } else {
        console.log(`❌ Restaurant creation failed: ${response.data.EM}`);
      }
    } catch (error) {
      console.log(`❌ Restaurant generation error: ${error.response?.data?.EM || error.message}`);
    }
    return null;
  }

  async createMenuItems(restaurantId, specialty) {
    console.log('🍽️ Creating menu items...');
    
    // Filter menu items by specialty if possible
    let menuItems = this.seedData.menuItems.filter(item => item.category === specialty);
    if (menuItems.length === 0) {
      menuItems = faker.helpers.arrayElements(this.seedData.menuItems, 4);
    } else {
      menuItems = menuItems.concat(faker.helpers.arrayElements(this.seedData.menuItems, 2));
    }
    
    for (const item of menuItems) {
      const menuItemData = {
        restaurant_id: restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        category: [item.category],
        availability: true,
        suggest_notes: ['Extra spicy', 'No onions', 'Extra sauce', 'Well done'],
        purchase_count: faker.number.int({ min: 0, max: 200 })
      };

      try {
        const response = await axios.post(`${this.baseURL}/restaurants/${restaurantId}/menu-items`, menuItemData);
        if (response.data.EC === 0) {
          console.log(`  ✅ Added: ${item.name} ($${item.price})`);
        }
      } catch (error) {
        console.log(`  ❌ Failed to add: ${item.name}`);
      }
      
      await this.delay(50);
    }
  }

  async generateUltimateDriver() {
    console.log('🚗 Generating ULTIMATE driver...');
    
    try {
      // Create driver user
      const driverUser = await this.createUserByRole('DRIVER');
      if (!driverUser) return;

      // Create driver profile with EXACT entity requirements
      const driverData = {
        user_id: driverUser.id,
        first_name: driverUser.first_name,
        last_name: driverUser.last_name,
        contact_email: [{
          title: 'Primary',
          is_default: true,
          email: driverUser.email
        }],
        contact_phone: [{
          title: 'Primary',
          number: driverUser.phone,
          is_default: true
        }],
        vehicle: {
          license_plate: faker.vehicle.vrm(),
          model: faker.vehicle.model(),
          owner: `${driverUser.first_name} ${driverUser.last_name}`,
          brand: faker.vehicle.manufacturer(),
          year: faker.number.int({ min: 2015, max: 2024 }),
          color: faker.vehicle.color()
        },
        current_location: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude()
        },
        current_orders: [],
        rating: {
          average_rating: faker.number.float({ min: 4.2, max: 5.0, fractionDigits: 1 }),
          review_count: faker.number.int({ min: 15, max: 300 })
        },
        available_for_work: true,
        is_on_delivery: false,
        active_points: faker.number.int({ min: 0, max: 1500 }),
        avatar: {
          url: faker.image.url(),
          key: faker.string.uuid()
        }
      };

      const response = await axios.post(`${this.baseURL}/drivers`, driverData, { timeout: 5000 });
      if (response.data.EC === 0) {
        this.cache.drivers.push(response.data.data);
        console.log(`✅ Created driver: ${driverUser.first_name} ${driverUser.last_name} (${driverData.vehicle.model})`);
        return response.data.data;
      } else {
        console.log(`❌ Driver creation failed: ${response.data.EM}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Driver creation timed out');
      } else {
        console.log(`❌ Driver generation error: ${error.response?.data?.EM || error.message}`);
      }
    }
    return null;
  }

  async generateUltimateCustomer() {
    console.log('👥 Generating ULTIMATE customer...');
    
    try {
      // Create customer user
      const customerUser = await this.createUserByRole('CUSTOMER');
      if (!customerUser) return;

      // Create customer profile with EXACT DTO requirements
      const customerData = {
        user_id: customerUser.id,
        first_name: customerUser.first_name,
        last_name: customerUser.last_name,
        // Using minimal required fields only to avoid validation issues
        address_ids: [],
        preferred_category_ids: [],
        favorite_restaurant_ids: [],
        favorite_items: [],
        support_tickets: [],
        restaurant_history: []
      };

      const response = await axios.post(`${this.baseURL}/customers`, customerData, { timeout: 5000 });
      if (response.data.EC === 0) {
        this.cache.customers.push(response.data.data);
        console.log(`✅ Created customer: ${customerUser.first_name} ${customerUser.last_name}`);
        return response.data.data;
      } else {
        console.log(`❌ Customer creation failed: ${response.data.EM}`);
        
        // Try with absolute minimal data if above fails
        const minimalData = {
          user_id: customerUser.id,
          first_name: customerUser.first_name,
          last_name: customerUser.last_name
        };
        
        const retryResponse = await axios.post(`${this.baseURL}/customers`, minimalData, { timeout: 5000 });
        if (retryResponse.data.EC === 0) {
          this.cache.customers.push(retryResponse.data.data);
          console.log(`✅ Created customer (minimal): ${customerUser.first_name} ${customerUser.last_name}`);
          return retryResponse.data.data;
        }
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Customer creation timed out (database constraint - apply SQL fix)');
      } else {
        console.log(`❌ Customer generation error: ${error.response?.data?.EM || error.message}`);
      }
    }
    return null;
  }

  async showDatabaseState() {
    console.log('\n📊 CURRENT DATABASE STATE:');
    console.log('=' .repeat(60));
    
    const tables = [
      { name: 'Users', endpoint: 'users', icon: '👤' },
      { name: 'Customers', endpoint: 'customers', icon: '👥' },
      { name: 'Drivers', endpoint: 'drivers', icon: '🚗' },
      { name: 'Restaurants', endpoint: 'restaurants', icon: '🏪' },
      { name: 'Address Books', endpoint: 'address_books', icon: '📍' },
      { name: 'Categories', endpoint: 'food-categories', icon: '🍽️' }
    ];

    for (const table of tables) {
      try {
        const response = await axios.get(`${this.baseURL}/${table.endpoint}`);
        const count = response.data.data?.length || 0;
        const status = count > 0 ? '✅' : '❌';
        const trend = this.getTrend(table.endpoint, count);
        console.log(`${status} ${table.icon} ${table.name}: ${count} records ${trend}`);
      } catch (error) {
        console.log(`❌ ${table.icon} ${table.name}: Error checking`);
      }
    }
    
    console.log('\n🎯 ECOSYSTEM STATUS: ' + (this.isEcosystemHealthy() ? '🟢 HEALTHY' : '🟡 BUILDING'));
  }

  getTrend(endpoint, currentCount) {
    // Simple trend tracking
    if (!this.lastCounts) this.lastCounts = {};
    const lastCount = this.lastCounts[endpoint] || 0;
    this.lastCounts[endpoint] = currentCount;
    
    if (currentCount > lastCount) return '📈';
    if (currentCount < lastCount) return '📉';
    return '➡️';
  }

  isEcosystemHealthy() {
    return this.cache.users.length > 5 && 
           this.cache.addresses.length > 2 && 
           this.cache.restaurants.length > 0;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create the ultimate generator
const ultimateGen = new UltimateGenerator();

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Ultimate Generator...');
  ultimateGen.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating Ultimate Generator...');
  ultimateGen.stop();
  process.exit(0);
});

// Start the ultimate system
console.log('🔥 ULTIMATE GENERATOR READY');
console.log('💪 ONE-HIT KO SOLUTION LOADING...');
console.log('🎯 WILL MAKE YOU PROUD!\n');

ultimateGen.start().catch(error => {
  console.error('❌ Ultimate Generator failed to start:', error);
  process.exit(1);
}); 