const axios = require('axios');
const { faker } = require('@faker-js/faker');

class LiveOrdersGenerator {
  constructor() {
    this.baseURL = 'http://127.0.0.1:1310';
    this.isRunning = false;
    this.intervalId = null;
    this.orderCounter = 1;
    
    // Cache for existing data
    this.customers = [];
    this.restaurants = [];
    this.drivers = [];
    
    console.log('🚛 Live Orders Generator initialized!');
    console.log('📦 Will generate realistic orders every 30 seconds');
  }

  // Load existing data for realistic relationships
  async loadExistingData() {
    try {
      console.log('🔄 Loading existing data for order generation...');
      
      // Load customers
      const customersRes = await axios.get(`${this.baseURL}/customers-fake`);
      this.customers = customersRes.data.data || [];
      
      // Load restaurants
      const restaurantsRes = await axios.get(`${this.baseURL}/restaurants-fake`);
      this.restaurants = restaurantsRes.data.data || [];
      
      // Load drivers (if available)
      try {
        const driversRes = await axios.get(`${this.baseURL}/drivers`);
        this.drivers = driversRes.data.data || [];
      } catch (error) {
        console.log('ℹ️ No drivers endpoint available, will create orders without drivers');
      }
      
      console.log(`✅ Loaded: ${this.customers.length} customers, ${this.restaurants.length} restaurants, ${this.drivers.length} drivers`);
      
      if (this.customers.length === 0 || this.restaurants.length === 0) {
        console.log('⚠️ Warning: Not enough data loaded. Run structured-database-populator.js first!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log(`❌ Error loading existing data: ${error.message}`);
      return false;
    }
  }

  // Generate a realistic order
  generateOrder() {
    if (this.customers.length === 0 || this.restaurants.length === 0) {
      throw new Error('No customers or restaurants available');
    }
    
    const customer = faker.helpers.arrayElement(this.customers);
    const restaurant = faker.helpers.arrayElement(this.restaurants);
    const driver = this.drivers.length > 0 ? faker.helpers.arrayElement(this.drivers) : null;
    
    // Random order status weighted towards completed orders
    const statuses = [
      { status: 'COMPLETED', weight: 70 },
      { status: 'PENDING', weight: 15 },
      { status: 'IN_PROGRESS', weight: 10 },
      { status: 'CANCELLED', weight: 5 }
    ];
    
    const randomWeight = Math.random() * 100;
    let cumulativeWeight = 0;
    let selectedStatus = 'COMPLETED';
    
    for (const statusOption of statuses) {
      cumulativeWeight += statusOption.weight;
      if (randomWeight <= cumulativeWeight) {
        selectedStatus = statusOption.status;
        break;
      }
    }
    
    // Generate realistic order data
    const orderData = {
      order_number: `ORD-${Date.now()}-${this.orderCounter++}`,
      customer_id: customer.id || customer.user_id,
      restaurant_id: restaurant.id,
      driver_id: driver?.id || null,
      status: selectedStatus,
      total_amount: faker.number.float({ min: 15.99, max: 89.99, fractionDigits: 2 }),
      delivery_fee: faker.number.float({ min: 2.99, max: 5.99, fractionDigits: 2 }),
      service_fee: faker.number.float({ min: 1.50, max: 3.50, fractionDigits: 2 }),
      tax_amount: faker.number.float({ min: 1.20, max: 8.99, fractionDigits: 2 }),
      order_items: this.generateOrderItems(),
      delivery_address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        postal_code: faker.location.zipCode(),
        coordinates: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude()
        }
      },
      estimated_delivery_time: faker.number.int({ min: 20, max: 60 }), // minutes
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || '',
      payment_method: faker.helpers.arrayElement(['CREDIT_CARD', 'CASH', 'DIGITAL_WALLET']),
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };
    
    return orderData;
  }

  // Generate realistic order items
  generateOrderItems() {
    const itemCount = faker.number.int({ min: 1, max: 4 });
    const items = [];
    
    for (let i = 0; i < itemCount; i++) {
      items.push({
        item_name: faker.helpers.arrayElement([
          'Margherita Pizza',
          'Chicken Burger',
          'Caesar Salad',
          'Beef Tacos',
          'Pad Thai',
          'Sushi Roll',
          'Fish & Chips',
          'Pasta Carbonara',
          'BBQ Wings',
          'Veggie Wrap'
        ]),
        quantity: faker.number.int({ min: 1, max: 3 }),
        unit_price: faker.number.float({ min: 8.99, max: 24.99, fractionDigits: 2 }),
        special_instructions: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) || ''
      });
    }
    
    return items;
  }

  // Create an order using the orders endpoint
  async createOrder() {
    try {
      const orderData = this.generateOrder();
      
      console.log(`\n📦 [${new Date().toLocaleTimeString()}] Creating new order...`);
      console.log(`🏪 Restaurant: ${orderData.restaurant_id}`);
      console.log(`👤 Customer: ${orderData.customer_id}`);
      console.log(`💰 Total: $${orderData.total_amount}`);
      console.log(`📊 Status: ${orderData.status}`);
      
      // Create the order via the orders endpoint
      const response = await axios.post(`${this.baseURL}/orders`, orderData);
      
      if (response.data.EC === 0 || response.data.EC === 'OK') {
        console.log(`✅ Order created successfully: ${orderData.order_number}`);
        
        // Trigger chart data update after creating order
        await this.triggerChartUpdate();
        
      } else {
        console.log(`❌ Failed to create order: ${response.data.EM}`);
      }
      
    } catch (error) {
      console.log(`❌ Error creating order: ${error.response?.data?.EM || error.message}`);
      console.log(`💡 Make sure your backend has the /orders endpoint available`);
    }
  }

  // Trigger chart data update to reflect new orders
  async triggerChartUpdate() {
    try {
      const now = new Date();
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      
      await axios.post(`${this.baseURL}/admin-chart/update`, null, {
        params: {
          start_date: weekAgo.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0],
          period_type: 'daily'
        }
      });
      
      console.log(`📊 Chart data updated to reflect new order`);
      
    } catch (error) {
      // Don't log chart update errors as they're secondary
    }
  }

  // Start generating orders
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Live orders generator is already running!');
      return;
    }
    
    // Load existing data first
    const dataLoaded = await this.loadExistingData();
    if (!dataLoaded) {
      console.log('❌ Cannot start without existing customer and restaurant data');
      console.log('💡 Run: node structured-database-populator.js first');
      return;
    }
    
    this.isRunning = true;
    console.log('\n🚀 Starting live orders generation...');
    console.log('📦 New orders will be created every 30 seconds');
    console.log('📊 This will feed the admin chart system with live data!');
    console.log('⏹️  Press Ctrl+C to stop\n');
    
    // Create first order immediately
    await this.createOrder();
    
    // Set up interval for every 30 seconds
    this.intervalId = setInterval(async () => {
      await this.createOrder();
    }, 30000); // 30 seconds
  }

  // Stop the generator
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Live orders generator is not running!');
      return;
    }
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('\n⏹️ Live orders generation stopped!');
    console.log('📊 Your admin charts will show the orders that were created');
  }

  // Show status
  status() {
    console.log('\n📦 Live Orders Generator Status:');
    console.log(`🔄 Running: ${this.isRunning ? 'YES' : 'NO'}`);
    console.log(`📦 Orders Created: ${this.orderCounter - 1}`);
    console.log(`👥 Customers Available: ${this.customers.length}`);
    console.log(`🏪 Restaurants Available: ${this.restaurants.length}`);
    console.log(`🚛 Drivers Available: ${this.drivers.length}`);
    
    if (this.isRunning) {
      console.log('⏱️  Next order in ~30 seconds');
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  if (global.ordersGenerator) {
    global.ordersGenerator.stop();
  }
  process.exit(0);
});

// Create and handle commands
const ordersGenerator = new LiveOrdersGenerator();
global.ordersGenerator = ordersGenerator;

const args = process.argv.slice(2);
const command = args[0] || 'start';

switch (command) {
  case 'start':
    ordersGenerator.start();
    break;
  case 'stop':
    ordersGenerator.stop();
    break;
  case 'status':
    ordersGenerator.status();
    break;
  default:
    console.log('Usage: node live-orders-generator.js [start|stop|status]');
    console.log('  start  - Start generating live orders every 30 seconds');
    console.log('  stop   - Stop the order generation');
    console.log('  status - Show current status');
}

module.exports = LiveOrdersGenerator; 