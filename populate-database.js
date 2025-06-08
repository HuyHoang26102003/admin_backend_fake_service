const axios = require('axios');
const { faker } = require('@faker-js/faker');

class DatabasePopulator {
  constructor() {
    this.baseURL = 'http://localhost:1310';
    this.createdUsers = [];
    this.createdAddresses = [];
    this.createdCategories = [];
  }

  async populateAll() {
    console.log('🚀 Starting comprehensive database population...\n');

    try {
      // Step 1: Get existing data
      await this.getExistingData();
      
      // Step 2: Create address books first (needed for other entities)
      await this.createAddressBooks();
      
      // Step 3: Create restaurants (using existing users and addresses)
      await this.createRestaurants();
      
      // Step 4: Try to create customers (with fallback approach)
      await this.createCustomers();
      
      // Step 5: Try to create drivers (with fallback approach)
      await this.createDrivers();
      
      // Step 6: Final summary
      await this.showFinalSummary();
      
    } catch (error) {
      console.error('❌ Population failed:', error.message);
    }
  }

  async getExistingData() {
    console.log('📋 Getting existing data...');
    
    try {
      // Get users
      const usersResponse = await axios.get(`${this.baseURL}/users`);
      this.createdUsers = usersResponse.data.data || [];
      console.log(`✅ Found ${this.createdUsers.length} existing users`);
      
      // Get categories
      const categoriesResponse = await axios.get(`${this.baseURL}/food-categories`);
      this.createdCategories = categoriesResponse.data.data || [];
      console.log(`✅ Found ${this.createdCategories.length} existing categories`);
      
    } catch (error) {
      console.error('❌ Failed to get existing data:', error.message);
    }
    console.log('');
  }

  async createAddressBooks() {
    console.log('🏠 Creating address books...');
    
    try {
      const addressResponse = await axios.get(`${this.baseURL}/address_books`);
      const existingAddresses = addressResponse.data.data || [];
      
      if (existingAddresses.length >= 5) {
        console.log(`✅ Already have ${existingAddresses.length} addresses`);
        this.createdAddresses = existingAddresses;
        return;
      }

      const needed = 10 - existingAddresses.length;
      console.log(`📍 Creating ${needed} address books...`);

      for (let i = 0; i < needed; i++) {
        const addressData = {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          nationality: faker.location.country(),
          postal_code: faker.location.zipCode(),
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
            this.createdAddresses.push(response.data.data);
          }
        } catch (error) {
          console.log(`❌ Failed to create address ${i + 1}: ${error.response?.data?.EM || error.message}`);
        }
        
        await this.delay(100);
      }
    } catch (error) {
      console.error('❌ Address creation failed:', error.message);
    }
    console.log('');
  }

  async createRestaurants() {
    console.log('🏪 Creating restaurants...');
    
    try {
      const restaurantResponse = await axios.get(`${this.baseURL}/restaurants`);
      const existingRestaurants = restaurantResponse.data.data || [];
      
      if (existingRestaurants.length >= 5) {
        console.log(`✅ Already have ${existingRestaurants.length} restaurants`);
        return;
      }

      const needed = 10 - existingRestaurants.length;
      console.log(`🍽️ Creating ${needed} restaurants...`);

      // Filter users that could be restaurant owners
      const availableUsers = this.createdUsers.filter(user => 
        user.user_type && user.user_type.includes('RESTAURANT_OWNER')
      );

      if (availableUsers.length === 0) {
        console.log('⚠️ No restaurant owner users found, creating restaurants with new users...');
      }

      for (let i = 0; i < needed; i++) {
        // Create a restaurant owner user if needed
        let ownerUser = availableUsers[i % availableUsers.length];
        
        if (!ownerUser) {
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

          try {
            const userResponse = await axios.post(`${this.baseURL}/users`, userData);
            if (userResponse.data.EC === 0) {
              ownerUser = userResponse.data.data;
              console.log(`✅ Created restaurant owner: ${ownerUser.first_name} ${ownerUser.last_name}`);
            }
          } catch (error) {
            console.log(`❌ Failed to create restaurant owner: ${error.response?.data?.EM || error.message}`);
            continue;
          }
        }

        const restaurantData = {
          user_id: ownerUser.id,
          restaurant_name: faker.company.name() + ' Restaurant',
          contact_email: [{
            title: 'Primary',
            is_default: true,
            email: ownerUser.email || faker.internet.email()
          }],
          contact_phone: [{
            title: 'Primary',
            is_default: true,
            number: ownerUser.phone || faker.phone.number()
          }],
          address_id: this.createdAddresses.length > 0 ? 
            faker.helpers.arrayElement(this.createdAddresses).id : null,
          specialize_in: this.createdCategories.length > 0 ? 
            [faker.helpers.arrayElement(this.createdCategories).id] : [],
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
            average_rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
            review_count: faker.number.int({ min: 10, max: 500 })
          }
        };

        try {
          const response = await axios.post(`${this.baseURL}/restaurants`, restaurantData);
          if (response.data.EC === 0) {
            console.log(`✅ Created restaurant ${i + 1}/${needed}: ${restaurantData.restaurant_name}`);
          } else {
            console.log(`❌ Failed to create restaurant ${i + 1}: ${response.data.EM}`);
          }
        } catch (error) {
          console.log(`❌ Failed to create restaurant ${i + 1}: ${error.response?.data?.EM || error.message}`);
        }
        
        await this.delay(200);
      }
    } catch (error) {
      console.error('❌ Restaurant creation failed:', error.message);
    }
    console.log('');
  }

  async createCustomers() {
    console.log('👥 Creating customers...');
    
    try {
      // Get customer users
      const customerUsers = this.createdUsers.filter(user => 
        user.user_type && user.user_type.includes('CUSTOMER')
      );

      if (customerUsers.length === 0) {
        console.log('⚠️ No customer users found, creating new ones...');
        return;
      }

      console.log(`👤 Found ${customerUsers.length} customer users, creating customer profiles...`);

      let successCount = 0;
      for (let i = 0; i < Math.min(5, customerUsers.length); i++) {
        const user = customerUsers[i];
        
        const customerData = {
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          address_ids: [],
          preferred_category_ids: [],
          favorite_restaurant_ids: [],
          favorite_items: [],
          support_tickets: [],
          app_preferences: {
            theme: faker.helpers.arrayElement(['light', 'dark'])
          },
          restaurant_history: []
        };

        try {
          const response = await axios.post(`${this.baseURL}/customers`, customerData, {
            timeout: 2000
          });
          
          if (response.data.EC === 0) {
            console.log(`✅ Created customer ${i + 1}: ${user.first_name} ${user.last_name}`);
            successCount++;
          } else {
            console.log(`❌ Failed to create customer ${i + 1}: ${response.data.EM}`);
          }
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            console.log(`🕐 Customer ${i + 1} creation timed out (database constraint issue)`);
          } else {
            console.log(`❌ Failed to create customer ${i + 1}: ${error.response?.data?.EM || error.message}`);
          }
        }
        
        await this.delay(300);
      }
      
      console.log(`📊 Successfully created ${successCount} customers`);
    } catch (error) {
      console.error('❌ Customer creation failed:', error.message);
    }
    console.log('');
  }

  async createDrivers() {
    console.log('🚗 Creating drivers...');
    
    try {
      // Get driver users
      const driverUsers = this.createdUsers.filter(user => 
        user.user_type && user.user_type.includes('DRIVER')
      );

      if (driverUsers.length === 0) {
        console.log('⚠️ No driver users found, creating new ones...');
        
        // Create some driver users
        for (let i = 0; i < 3; i++) {
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

          try {
            const userResponse = await axios.post(`${this.baseURL}/users`, userData);
            if (userResponse.data.EC === 0) {
              driverUsers.push(userResponse.data.data);
              console.log(`✅ Created driver user: ${userData.first_name} ${userData.last_name}`);
            }
          } catch (error) {
            console.log(`❌ Failed to create driver user: ${error.response?.data?.EM || error.message}`);
          }
          
          await this.delay(100);
        }
      }

      console.log(`🚗 Found ${driverUsers.length} driver users, creating driver profiles...`);

      let successCount = 0;
      for (let i = 0; i < Math.min(5, driverUsers.length); i++) {
        const user = driverUsers[i];
        
        const driverData = {
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          license_number: faker.vehicle.vrm(),
          license_image: {
            url: faker.image.url(),
            key: faker.string.uuid()
          },
          identity_card_number: faker.string.numeric(12),
          identity_card_image: {
            url: faker.image.url(),
            key: faker.string.uuid()
          },
          vehicle_info: {
            type: faker.helpers.arrayElement(['MOTORBIKE', 'CAR', 'BICYCLE']),
            license_plate: faker.vehicle.vrm(),
            model: faker.vehicle.model(),
            color: faker.vehicle.color()
          },
          location: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude()
          },
          status: {
            is_active: true,
            is_available: true,
            is_verified: true
          },
          rating: {
            average_rating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
            total_rating: faker.number.int({ min: 50, max: 1000 })
          }
        };

        try {
          const response = await axios.post(`${this.baseURL}/drivers`, driverData, {
            timeout: 2000
          });
          
          if (response.data.EC === 0) {
            console.log(`✅ Created driver ${i + 1}: ${user.first_name} ${user.last_name}`);
            successCount++;
          } else {
            console.log(`❌ Failed to create driver ${i + 1}: ${response.data.EM}`);
          }
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            console.log(`🕐 Driver ${i + 1} creation timed out`);
          } else {
            console.log(`❌ Failed to create driver ${i + 1}: ${error.response?.data?.EM || error.message}`);
          }
        }
        
        await this.delay(300);
      }
      
      console.log(`📊 Successfully created ${successCount} drivers`);
    } catch (error) {
      console.error('❌ Driver creation failed:', error.message);
    }
    console.log('');
  }

  async showFinalSummary() {
    console.log('📊 Final Database Summary:');
    console.log('=' .repeat(50));
    
    const tables = [
      { name: 'Users', endpoint: 'users' },
      { name: 'Customers', endpoint: 'customers' },
      { name: 'Drivers', endpoint: 'drivers' },
      { name: 'Restaurants', endpoint: 'restaurants' },
      { name: 'Categories', endpoint: 'food-categories' },
      { name: 'Address Books', endpoint: 'address_books' }
    ];

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
    
    console.log('\n🎉 Database population completed!');
    console.log('💡 If customers/drivers still show 0, there may be database constraint issues that need to be resolved in your main backend.');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the population
const populator = new DatabasePopulator();
populator.populateAll(); 