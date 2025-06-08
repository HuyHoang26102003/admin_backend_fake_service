const axios = require('axios');
const { faker } = require('@faker-js/faker');

class AutoGenerator {
  constructor() {
    this.baseURL = 'http://localhost:1310';
    this.isRunning = false;
    this.interval = null;
    
    // Cache for dependencies
    this.cache = {
      users: [],
      addresses: [],
      categories: [],
      restaurants: [],
      menuItems: []
    };
    
    // Hardcoded menu items for consistency
    this.hardcodedMenuItems = [
      { name: 'Classic Burger', price: 12.99, category: 'Burgers' },
      { name: 'Margherita Pizza', price: 15.50, category: 'Pizza' },
      { name: 'Chicken Pad Thai', price: 13.75, category: 'Thai' },
      { name: 'Caesar Salad', price: 9.99, category: 'Salads' },
      { name: 'Beef Tacos', price: 11.25, category: 'Mexican' },
      { name: 'Sushi Roll Set', price: 18.99, category: 'Japanese' },
      { name: 'Fish & Chips', price: 14.50, category: 'British' },
      { name: 'Chicken Curry', price: 16.75, category: 'Indian' },
      { name: 'BBQ Ribs', price: 22.99, category: 'BBQ' },
      { name: 'Vegetable Stir Fry', price: 10.99, category: 'Vegetarian' }
    ];
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Auto-generator is already running!');
      return;
    }

    console.log('🚀 Starting Auto-Generator System...');
    console.log('⏰ Will generate customers, drivers, and restaurants every 30 seconds');
    console.log('🔄 Press Ctrl+C to stop\n');

    this.isRunning = true;
    
    // Initial setup
    await this.initializeCache();
    
    // Start the interval
    this.interval = setInterval(async () => {
      await this.generateCycle();
    }, 30000); // 30 seconds

    // Run first cycle immediately
    await this.generateCycle();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('\n🛑 Auto-generator stopped');
  }

  async initializeCache() {
    console.log('🔧 Initializing cache and dependencies...');
    
    try {
      // Load existing data
      await this.refreshCache();
      
      // Ensure we have minimum dependencies
      await this.ensureMinimumAddresses();
      await this.ensureMinimumCategories();
      
      console.log('✅ Cache initialized successfully\n');
    } catch (error) {
      console.error('❌ Failed to initialize cache:', error.message);
    }
  }

  async refreshCache() {
    try {
      // Get users
      const usersResponse = await axios.get(`${this.baseURL}/users`);
      this.cache.users = usersResponse.data.data || [];
      
      // Get addresses
      const addressResponse = await axios.get(`${this.baseURL}/address_books`);
      this.cache.addresses = addressResponse.data.data || [];
      
      // Get categories
      const categoriesResponse = await axios.get(`${this.baseURL}/food-categories`);
      this.cache.categories = categoriesResponse.data.data || [];
      
      // Get restaurants
      const restaurantsResponse = await axios.get(`${this.baseURL}/restaurants`);
      this.cache.restaurants = restaurantsResponse.data.data || [];
      
      console.log(`📊 Cache: ${this.cache.users.length} users, ${this.cache.addresses.length} addresses, ${this.cache.categories.length} categories, ${this.cache.restaurants.length} restaurants`);
    } catch (error) {
      console.error('❌ Failed to refresh cache:', error.message);
    }
  }

  async ensureMinimumAddresses() {
    if (this.cache.addresses.length < 5) {
      console.log('📍 Creating minimum addresses...');
      
      const needed = 5 - this.cache.addresses.length;
      for (let i = 0; i < needed; i++) {
        const now = Math.floor(Date.now() / 1000);
        
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
          is_default: i === 0,
          created_at: now,
          updated_at: now
        };

        try {
          const response = await axios.post(`${this.baseURL}/address_books`, addressData);
          if (response.data.EC === 0) {
            this.cache.addresses.push(response.data.data);
            console.log(`✅ Created address: ${addressData.street}`);
          }
        } catch (error) {
          console.log(`❌ Failed to create address: ${error.response?.data?.EM || error.message}`);
        }
        
        await this.delay(100);
      }
    }
  }

  async ensureMinimumCategories() {
    // Categories should already exist, but let's make sure
    if (this.cache.categories.length === 0) {
      console.log('⚠️ No categories found - this might cause issues');
    }
  }

  async generateCycle() {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n🔄 [${timestamp}] Starting generation cycle...`);
    
    try {
      // Refresh cache first
      await this.refreshCache();
      
      // Generate in order of dependencies
      await this.generateRestaurant();
      await this.generateDriver();
      await this.generateCustomer();
      
      // Show current counts
      await this.showCurrentCounts();
      
    } catch (error) {
      console.error('❌ Generation cycle failed:', error.message);
    }
  }

  async generateRestaurant() {
    console.log('🏪 Generating restaurant...');
    
    try {
      // Create restaurant owner user if needed
      let ownerUser = this.cache.users.find(user => 
        user.user_type && user.user_type.includes('RESTAURANT_OWNER')
      );
      
      if (!ownerUser) {
        console.log('👤 Creating restaurant owner user...');
        const userData = {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          password: faker.internet.password({ length: 8 }),
          phone: faker.phone.number(),
          user_type: ['RESTAURANT_OWNER'],
          address: [],
          is_verified: true
        };

        const userResponse = await axios.post(`${this.baseURL}/users`, userData);
        if (userResponse.data.EC === 0) {
          ownerUser = userResponse.data.data;
          this.cache.users.push(ownerUser);
          console.log(`✅ Created owner: ${ownerUser.first_name} ${ownerUser.last_name}`);
        } else {
          console.log('❌ Failed to create restaurant owner');
          return;
        }
      }

      // Create restaurant
      const restaurantData = {
        owner_id: ownerUser.id,
        owner_name: `${ownerUser.first_name} ${ownerUser.last_name}`,
        restaurant_name: faker.company.name() + ' ' + faker.helpers.arrayElement(['Restaurant', 'Bistro', 'Cafe', 'Kitchen', 'Grill']),
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
          mon: { from: 28800, to: 79200 },
          tue: { from: 28800, to: 79200 },
          wed: { from: 28800, to: 79200 },
          thu: { from: 28800, to: 79200 },
          fri: { from: 28800, to: 79200 },
          sat: { from: 32400, to: 82800 },
          sun: { from: 32400, to: 75600 }
        },
        status: {
          is_open: true,
          is_active: true,
          is_accepted_orders: true
        }
      };

      const response = await axios.post(`${this.baseURL}/restaurants`, restaurantData);
      if (response.data.EC === 0) {
        const newRestaurant = response.data.data;
        this.cache.restaurants.push(newRestaurant);
        console.log(`✅ Created restaurant: ${restaurantData.restaurant_name}`);
        
        // Create menu items for this restaurant
        await this.createMenuItemsForRestaurant(newRestaurant.id);
        
      } else {
        console.log(`❌ Failed to create restaurant: ${response.data.EM}`);
      }
    } catch (error) {
      console.log(`❌ Restaurant generation failed: ${error.response?.data?.EM || error.message}`);
    }
  }

  async createMenuItemsForRestaurant(restaurantId) {
    console.log('🍽️ Creating menu items...');
    
    // Create 3-5 random menu items from our hardcoded list
    const itemCount = faker.number.int({ min: 3, max: 5 });
    const selectedItems = faker.helpers.arrayElements(this.hardcodedMenuItems, itemCount);
    
    for (const item of selectedItems) {
      const menuItemData = {
        restaurant_id: restaurantId,
        name: item.name,
        description: faker.lorem.sentence(),
        price: item.price,
        category: [item.category],
        availability: true,
        suggest_notes: [
          'Extra spicy',
          'No onions',
          'Extra cheese',
          'Well done'
        ],
        purchase_count: faker.number.int({ min: 0, max: 100 })
      };

      try {
        const response = await axios.post(`${this.baseURL}/restaurants/${restaurantId}/menu-items`, menuItemData);
        if (response.data.EC === 0) {
          console.log(`  ✅ Added menu item: ${item.name}`);
        }
      } catch (error) {
        console.log(`  ❌ Failed to add menu item: ${item.name}`);
      }
      
      await this.delay(100);
    }
  }

  async generateDriver() {
    console.log('🚗 Generating driver...');
    
    try {
      // Create driver user
      const userData = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
        phone: faker.phone.number(),
        user_type: ['DRIVER'],
        address: [],
        is_verified: true
      };

      const userResponse = await axios.post(`${this.baseURL}/users`, userData);
      if (userResponse.data.EC !== 0) {
        console.log('❌ Failed to create driver user');
        return;
      }

      const driverUser = userResponse.data.data;
      this.cache.users.push(driverUser);
      console.log(`✅ Created driver user: ${driverUser.first_name} ${driverUser.last_name}`);

      // Create driver profile
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
          color: faker.vehicle.color()
        },
        current_location: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude()
        },
        current_orders: [],
        available_for_work: true,
        is_on_delivery: false,
        active_points: faker.number.int({ min: 0, max: 1000 }),
        rating: {
          average_rating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
          review_count: faker.number.int({ min: 10, max: 200 })
        }
      };

      const response = await axios.post(`${this.baseURL}/drivers`, driverData, { timeout: 3000 });
      if (response.data.EC === 0) {
        console.log(`✅ Created driver profile: ${driverUser.first_name} ${driverUser.last_name}`);
      } else {
        console.log(`❌ Failed to create driver profile: ${response.data.EM}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Driver creation timed out');
      } else {
        console.log(`❌ Driver generation failed: ${error.response?.data?.EM || error.message}`);
      }
    }
  }

  async generateCustomer() {
    console.log('👥 Generating customer...');
    
    try {
      // Create customer user
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

      const userResponse = await axios.post(`${this.baseURL}/users`, userData);
      if (userResponse.data.EC !== 0) {
        console.log('❌ Failed to create customer user');
        return;
      }

      const customerUser = userResponse.data.data;
      this.cache.users.push(customerUser);
      console.log(`✅ Created customer user: ${customerUser.first_name} ${customerUser.last_name}`);

      // Create customer profile with minimal data
      const customerData = {
        user_id: customerUser.id,
        first_name: customerUser.first_name,
        last_name: customerUser.last_name
      };

      const response = await axios.post(`${this.baseURL}/customers`, customerData, { timeout: 3000 });
      if (response.data.EC === 0) {
        console.log(`✅ Created customer profile: ${customerUser.first_name} ${customerUser.last_name}`);
      } else {
        console.log(`❌ Failed to create customer profile: ${response.data.EM}`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('🕐 Customer creation timed out (database constraint issue)');
      } else {
        console.log(`❌ Customer generation failed: ${error.response?.data?.EM || error.message}`);
      }
    }
  }

  async showCurrentCounts() {
    try {
      const tables = [
        { name: 'Users', endpoint: 'users' },
        { name: 'Customers', endpoint: 'customers' },
        { name: 'Drivers', endpoint: 'drivers' },
        { name: 'Restaurants', endpoint: 'restaurants' },
        { name: 'Address Books', endpoint: 'address_books' }
      ];

      console.log('\n📊 Current Database Counts:');
      for (const table of tables) {
        try {
          const response = await axios.get(`${this.baseURL}/${table.endpoint}`);
          const count = response.data.data?.length || 0;
          const status = count > 0 ? '✅' : '❌';
          console.log(`${status} ${table.name}: ${count} records`);
        } catch (error) {
          console.log(`❌ ${table.name}: Error checking`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to show counts');
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create and start the auto-generator
const generator = new AutoGenerator();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received interrupt signal...');
  generator.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received terminate signal...');
  generator.stop();
  process.exit(0);
});

// Start the generator
generator.start().catch(error => {
  console.error('❌ Failed to start auto-generator:', error);
  process.exit(1);
}); 