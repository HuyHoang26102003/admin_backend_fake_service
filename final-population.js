const axios = require('axios');
const { faker } = require('@faker-js/faker');

class FinalDatabasePopulator {
  constructor() {
    this.baseURL = 'http://localhost:1310';
    this.createdUsers = [];
    this.createdAddresses = [];
    this.createdCategories = [];
  }

  async populateAll() {
    console.log('🚀 Starting FINAL database population...\n');

    try {
      await this.getExistingData();
      await this.createWorkingAddressBooks();
      await this.createWorkingRestaurants();
      await this.createWorkingDrivers();
      await this.createWorkingCustomers();
      await this.showFinalSummary();
    } catch (error) {
      console.error('❌ Population failed:', error.message);
    }
  }

  async getExistingData() {
    console.log('📋 Getting existing data...');
    
    try {
      const usersResponse = await axios.get(`${this.baseURL}/users`);
      this.createdUsers = usersResponse.data.data || [];
      console.log(`✅ Found ${this.createdUsers.length} existing users`);
      
      const categoriesResponse = await axios.get(`${this.baseURL}/food-categories`);
      this.createdCategories = categoriesResponse.data.data || [];
      console.log(`✅ Found ${this.createdCategories.length} existing categories`);
      
      try {
        const addressResponse = await axios.get(`${this.baseURL}/address_books`);
        this.createdAddresses = addressResponse.data.data || [];
        console.log(`✅ Found ${this.createdAddresses.length} existing addresses`);
      } catch (error) {
        console.log('⚠️ Could not fetch addresses');
      }
    } catch (error) {
      console.error('❌ Failed to get existing data:', error.message);
    }
    console.log('');
  }

  async createWorkingAddressBooks() {
    console.log('🏠 Creating address books...');
    
    if (this.createdAddresses.length >= 3) {
      console.log(`✅ Already have ${this.createdAddresses.length} addresses`);
      return;
    }

    const needed = 5;
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
        console.log(`📤 Creating address ${i + 1}: ${addressData.street}`);
        const response = await axios.post(`${this.baseURL}/address_books`, addressData);
        if (response.data.EC === 0) {
          console.log(`✅ Created address ${i + 1}: ${addressData.street}`);
          this.createdAddresses.push(response.data.data);
        } else {
          console.log(`❌ Failed: ${response.data.EM}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
      }
      
      await this.delay(200);
    }
    console.log('');
  }

  async createWorkingRestaurants() {
    console.log('🏪 Creating restaurants...');
    
    if (this.createdAddresses.length === 0) {
      console.log('❌ No addresses available');
      return;
    }
    
    try {
      const restaurantResponse = await axios.get(`${this.baseURL}/restaurants`);
      const existingRestaurants = restaurantResponse.data.data || [];
      
      if (existingRestaurants.length >= 3) {
        console.log(`✅ Already have ${existingRestaurants.length} restaurants`);
        return;
      }

      const availableUsers = this.createdUsers.filter(user => 
        user.user_type && user.user_type.includes('RESTAURANT_OWNER')
      );

      const needed = Math.min(3, availableUsers.length);
      console.log(`🍽️ Creating ${needed} restaurants...`);

      for (let i = 0; i < needed; i++) {
        const ownerUser = availableUsers[i];
        
        const restaurantData = {
          owner_id: ownerUser.id,
          owner_name: `${ownerUser.first_name} ${ownerUser.last_name}`,
          restaurant_name: faker.company.name() + ' Restaurant',
          contact_email: [{
            title: 'Primary',
            is_default: true,
            email: ownerUser.email || faker.internet.email()
          }],
          contact_phone: [{
            title: 'Primary',
            number: ownerUser.phone || faker.phone.number(),
            is_default: true
          }],
          address_id: this.createdAddresses[i % this.createdAddresses.length].id,
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

        try {
          console.log(`📤 Creating restaurant: ${restaurantData.restaurant_name}`);
          const response = await axios.post(`${this.baseURL}/restaurants`, restaurantData);
          if (response.data.EC === 0) {
            console.log(`✅ Created restaurant: ${restaurantData.restaurant_name}`);
          } else {
            console.log(`❌ Failed: ${response.data.EM}`);
          }
        } catch (error) {
          console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
        }
        
        await this.delay(500);
      }
    } catch (error) {
      console.error('❌ Restaurant creation failed:', error.message);
    }
    console.log('');
  }

  async createWorkingDrivers() {
    console.log('🚗 Creating drivers...');
    
    const driverUsers = this.createdUsers.filter(user => 
      user.user_type && user.user_type.includes('DRIVER')
    );

    const needed = Math.min(2, driverUsers.length);
    console.log(`🚗 Creating ${needed} driver profiles...`);

    let successCount = 0;
    for (let i = 0; i < needed; i++) {
      const user = driverUsers[i];
      
      const driverData = {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        contact_email: [{
          title: 'Primary',
          is_default: true,
          email: user.email
        }],
        contact_phone: [{
          title: 'Primary',
          number: user.phone,
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

      try {
        console.log(`📤 Creating driver: ${user.first_name} ${user.last_name}`);
        const response = await axios.post(`${this.baseURL}/drivers`, driverData, {
          timeout: 5000
        });
        
        if (response.data.EC === 0) {
          console.log(`✅ Created driver: ${user.first_name} ${user.last_name}`);
          successCount++;
        } else {
          console.log(`❌ Failed: ${response.data.EM}`);
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.log(`🕐 Driver creation timed out`);
        } else {
          console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
        }
      }
      
      await this.delay(1000);
    }
    
    console.log(`📊 Successfully created ${successCount} drivers`);
    console.log('');
  }

  async createWorkingCustomers() {
    console.log('👥 Creating customers...');
    
    const customerUsers = this.createdUsers.filter(user => 
      user.user_type && user.user_type.includes('CUSTOMER')
    );

    if (customerUsers.length === 0) {
      console.log('⚠️ No customer users found');
      return;
    }

    let successCount = 0;
    for (let i = 0; i < Math.min(2, customerUsers.length); i++) {
      const user = customerUsers[i];
      
      const customerData = {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name
      };

      try {
        console.log(`📤 Creating customer: ${user.first_name} ${user.last_name}`);
        const response = await axios.post(`${this.baseURL}/customers`, customerData, {
          timeout: 5000
        });
        
        if (response.data.EC === 0) {
          console.log(`✅ Created customer: ${user.first_name} ${user.last_name}`);
          successCount++;
        } else {
          console.log(`❌ Failed: ${response.data.EM}`);
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.log(`🕐 Customer creation timed out`);
        } else {
          console.log(`❌ Error: ${error.response?.data?.EM || error.message}`);
        }
      }
      
      await this.delay(1000);
    }
    
    console.log(`📊 Successfully created ${successCount} customers`);
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
    console.log('💡 Your NeonDB should now have data in multiple tables!');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const populator = new FinalDatabasePopulator();
populator.populateAll(); 